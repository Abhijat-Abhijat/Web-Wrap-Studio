const path = require("path");
const fs = require("fs/promises");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function pngFromDataUrl(dataUrl) {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) return null;
  const buf = Buffer.from(m[1], "base64");
  return buf.length > 8 && buf.length <= 5 * 1024 * 1024 && buf.subarray(0, 8).equals(PNG_SIGNATURE)
    ? buf
    : null;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "paneshell-app";
}

const PERMISSIONS = ["notifications", "media", "geolocation", "clipboard-read", "fullscreen"];

// Validates untrusted options; returns the config fragment. Never throws.
function normalizeOptions(options) {
  const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const bool = (v, def) => (typeof v === "boolean" ? v : def);
  const str = (v, max, noNl) =>
    typeof v === "string" && v.length <= max && !(noNl && /[\r\n]/.test(v)) ? v : "";
  const dim = (v, min, max, def) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : def;
  try {
    const o = obj(options), w = obj(o.window), t = obj(o.tray), p = obj(o.permissions);
    return {
      window: {
        width: dim(w.width, 320, 3840, 1200),
        height: dim(w.height, 240, 2160, 800),
        frameless: bool(w.frameless, false),
        alwaysOnTop: bool(w.alwaysOnTop, false),
        rememberPosition: bool(w.rememberPosition, true),
      },
      tray: { enabled: bool(t.enabled, false), minimizeToTray: bool(t.minimizeToTray, false) },
      startOnLogin: bool(o.startOnLogin, false),
      injectCss: str(o.injectCss, 20000),
      injectJs: str(o.injectJs, 20000),
      userAgent: str(o.userAgent, 300, true),
      permissions: {
        allow: Array.isArray(p.allow) ? PERMISSIONS.filter((x) => p.allow.includes(x)) : [],
      },
    };
  } catch {
    return normalizeOptions(undefined);
  }
}

async function generateProject({ url, name, description, outputDir, iconDataUrl, options }) {
  const slug = slugify(name);
  const projectDir = path.join(outputDir, slug);

  await fs.mkdir(projectDir, { recursive: true });
  await fs.mkdir(path.join(projectDir, "build"), { recursive: true });

  const pkg = {
    name: slug,
    version: "1.0.0",
    description: description || `${name}, packaged as a desktop app.`,
    main: "main.js",
    author: "",
    license: "UNLICENSED",
    private: true,
    scripts: {
      start: "electron .",
      dist: "electron-builder --win --linux --mac",
      "dist:win": "electron-builder --win",
      "dist:linux": "electron-builder --linux",
      "dist:mac": "electron-builder --mac",
    },
    devDependencies: {
      electron: "^38.8.6",
      "electron-builder": "^25.0.0",
    },
    build: {
      appId: `com.paneshell.${slug}`,
      productName: name,
      directories: { output: "dist" },
      files: ["main.js", "preload.js", "index.html", "offline.html", "paneshell.config.json", "build/icon.png"],
      win: { target: "nsis", icon: "build/icon.png" },
      nsis: { oneClick: false, allowToChangeInstallationDirectory: true },
      linux: { target: "deb", icon: "build/icon.png", category: "Utility" },
      mac: { target: "dmg", icon: "build/icon.png" },
    },
  };

  await fs.writeFile(
    path.join(projectDir, "package.json"),
    JSON.stringify(pkg, null, 2)
  );

  // Every generated-app feature is a key here; main.js reads it at startup.
  const config = {
    url,
    name,
    ...normalizeOptions(options),
    openExternalLinksInBrowser: true,
    singleInstance: true,
  };
  await fs.writeFile(
    path.join(projectDir, "paneshell.config.json"),
    JSON.stringify(config, null, 2)
  );

  await fs.writeFile(
    path.join(projectDir, "build", "icon.png"),
    pngFromDataUrl(iconDataUrl) ||
      (await fs.readFile(path.join(__dirname, "../../build/icon.png")))
  );

  await fs.writeFile(path.join(projectDir, "main.js"), wrappedMainTemplate());
  await fs.writeFile(path.join(projectDir, "preload.js"), wrappedPreloadTemplate());
  await fs.writeFile(path.join(projectDir, "offline.html"), wrappedOfflineTemplate(name));
  await fs.writeFile(path.join(projectDir, "index.html"), wrappedIndexTemplate(name));
  await fs.writeFile(
    path.join(projectDir, "README.md"),
    wrappedReadmeTemplate(name, slug)
  );

  return projectDir;
}

function wrappedMainTemplate() {
  // No backticks or dollar-brace inside: this is itself a template literal.
  // All user data comes from paneshell.config.json, never interpolated here.
  return `const { app, BrowserWindow, shell, Tray, Menu, nativeImage, screen, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const config = require("./paneshell.config.json");

const appOrigin = new URL(config.url).origin;
let win;
let tray;
let quitting = false;

function isExternal(url) {
  try {
    return new URL(url).origin !== appOrigin;
  } catch {
    return true;
  }
}

function openExternal(url) {
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") shell.openExternal(url);
  } catch {}
}

const stateFile = () => path.join(app.getPath("userData"), "window-state.json");

// Saved bounds are untrusted: validate, clamp size, drop position if off-screen.
function loadState() {
  try {
    const s = JSON.parse(fs.readFileSync(stateFile(), "utf8"));
    if (!Number.isFinite(s.width) || !Number.isFinite(s.height)) return {};
    const st = {
      width: Math.min(3840, Math.max(320, Math.round(s.width))),
      height: Math.min(2160, Math.max(240, Math.round(s.height))),
    };
    if (Number.isFinite(s.x) && Number.isFinite(s.y)) {
      const visible = screen.getAllDisplays().some((d) => {
        const a = d.workArea;
        return s.x < a.x + a.width - 50 && s.x + st.width > a.x + 50 && s.y >= a.y && s.y < a.y + a.height - 50;
      });
      if (visible) {
        st.x = Math.round(s.x);
        st.y = Math.round(s.y);
      }
    }
    return st;
  } catch {
    return {};
  }
}

function saveState() {
  try {
    if (win && !win.isDestroyed()) fs.writeFileSync(stateFile(), JSON.stringify(win.getNormalBounds()));
  } catch {}
}

function showWindow() {
  if (!win) return;
  if (!win.isVisible()) win.show();
  if (win.isMinimized()) win.restore();
  win.focus();
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, "build", "icon.png")).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip(config.name);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show", click: showWindow },
      { label: "Quit", click: () => { quitting = true; app.quit(); } },
    ])
  );
  tray.on("click", showWindow);
}

function setupPermissions(ses) {
  const allowed = (permission, url) => config.permissions.allow.includes(permission) && !isExternal(url);
  ses.setPermissionRequestHandler((wc, permission, callback, details) =>
    callback(allowed(permission, (details && details.requestingUrl) || wc.getURL()))
  );
  ses.setPermissionCheckHandler((wc, permission, origin) => allowed(permission, origin || (wc && wc.getURL()) || ""));
}

function createWindow() {
  const w = config.window;
  const saved = w.rememberPosition ? loadState() : {};
  win = new BrowserWindow({
    width: saved.width || w.width,
    height: saved.height || w.height,
    x: saved.x,
    y: saved.y,
    frame: !w.frameless,
    alwaysOnTop: w.alwaysOnTop,
    title: config.name,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  const wc = win.webContents;

  if (w.rememberPosition) win.on("close", saveState);
  win.on("close", (event) => {
    if (config.tray.enabled && config.tray.minimizeToTray && !quitting) {
      event.preventDefault();
      win.hide();
    }
  });

  setupPermissions(wc.session);
  if (config.userAgent) wc.setUserAgent(config.userAgent);

  if (config.openExternalLinksInBrowser) {
    wc.setWindowOpenHandler(({ url }) => {
      if (isExternal(url)) {
        openExternal(url);
        return { action: "deny" };
      }
      return { action: "allow" };
    });
    wc.on("will-navigate", (event, url) => {
      if (isExternal(url)) {
        event.preventDefault();
        openExternal(url);
      }
    });
  }

  // Offline / error page; offline.html calls retry() and also retries on the online event.
  wc.on("did-fail-load", (event, code, desc, failedUrl, isMainFrame) => {
    if (isMainFrame && code !== -3 && !failedUrl.startsWith("file:")) {
      win.loadFile(path.join(__dirname, "offline.html"));
    }
  });

  wc.on("dom-ready", () => {
    if (!/^https?:/.test(wc.getURL())) return;
    if (config.injectCss) wc.insertCSS(config.injectCss).catch(() => {});
    if (config.injectJs) wc.executeJavaScript(config.injectJs).catch(() => {});
  });

  win.loadURL(config.url);
}

ipcMain.on("paneshell:retry", (event) => {
  if (win && event.sender === win.webContents && event.senderFrame.url.startsWith("file:")) win.loadURL(config.url);
});

if (config.singleInstance && !app.requestSingleInstanceLock()) {
  app.quit();
} else {
  if (config.singleInstance) {
    app.on("second-instance", showWindow);
  }

  app.on("before-quit", () => {
    quitting = true;
  });

  app.whenReady().then(() => {
    app.setLoginItemSettings({ openAtLogin: config.startOnLogin });
    createWindow();
    if (config.tray.enabled) createTray();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      else showWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
`;
}

function wrappedPreloadTemplate() {
  return `// Only bridged API: lets the offline page ask main to reload the site.
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("paneshell", { retry: () => ipcRenderer.send("paneshell:retry") });
`;
}

function wrappedOfflineTemplate(name) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
<title>${escapeHtml(name)}</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #F8F6F1; color: #101820; font: 16px system-ui, sans-serif; text-align: center; }
  main { max-width: 360px; padding: 24px; }
  button { margin-top: 16px; padding: 10px 24px; border: 0; border-radius: 6px; background: #101820; color: #F8F6F1; font: inherit; cursor: pointer; }
</style>
</head>
<body>
<main>
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#101820" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M8 24a34 34 0 0 1 48 0M16 34a22 22 0 0 1 32 0M25 44a10 10 0 0 1 14 0"/><path d="M10 54L54 10"/></svg>
  <h1>Can't reach ${escapeHtml(name)}</h1>
  <p>Check your connection. We'll retry automatically when you're back online.</p>
  <button id="retry">Retry</button>
</main>
<script>
  const retry = () => window.paneshell && window.paneshell.retry();
  document.getElementById("retry").addEventListener("click", retry);
  window.addEventListener("online", retry);
</script>
</body>
</html>
`;
}

function wrappedIndexTemplate(name) {
  return `<!doctype html>
<html>
<head><meta charset="UTF-8"><title>${escapeHtml(name)}</title></head>
<body>
  <!-- main.js loads the target URL directly; this file is unused
       unless you switch main.js to loadFile for a local shell instead. -->
</body>
</html>
`;
}

function wrappedReadmeTemplate(name, slug) {
  return `# ${escapeHtml(name)}

Made with Paneshell.

## Run locally

\`\`\`
npm install
npm start
\`\`\`

## Build installers

\`\`\`
npm install
npm run dist:linux   # produces dist/${slug}_*.deb
npm run dist:win     # produces dist/${slug}\\ Setup\\ *.exe (needs Windows or Wine)
npm run dist:mac     # produces dist/${slug}-*.dmg (needs macOS)
\`\`\`

Replace \`build/icon.png\` with your own 1024×1024 icon before building.
`;
}

module.exports = { generateProject, normalizeOptions, slugify, pngFromDataUrl };
