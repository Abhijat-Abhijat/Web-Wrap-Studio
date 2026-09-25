const { app, BrowserWindow, ipcMain, dialog, shell, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { constants: fsConstants } = require("fs");
const { spawn } = require("child_process");
const { generateProject, pngFromDataUrl } = require("./generator");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1040,
    height: 760,
    minWidth: 720,
    minHeight: 600,
    title: "WebWrap Studio",
    backgroundColor: "#f5f5f7",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Folders the renderer may ask us to reveal (see revealPath).
const allowedRoots = new Set();
const defaultOutputDir = () => path.join(app.getPath("documents"), "WebWrap Studio");

// ─────────────────────────────────────────────────────────────────────────
// IPC handlers
// ─────────────────────────────────────────────────────────────────────────

ipcMain.handle("webwrap:select-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle("webwrap:default-output-dir", async () => {
  const dir = defaultOutputDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
});

ipcMain.handle("webwrap:inspect-url", async (_event, url) => {
  try {
    return await inspectUrl(url);
  } catch {
    return { ok: false };
  }
});

ipcMain.handle("webwrap:create-project", async (_event, payload) => {
  try {
    const clean = await validatePayload(payload);
    const projectDir = await generateProject(clean);
    allowedRoots.add(projectDir);
    return { ok: true, projectDir };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to create the project." };
  }
});

ipcMain.handle("webwrap:open-folder", async (_event, folderPath) => {
  await shell.openPath(folderPath);
});

ipcMain.handle("webwrap:reveal-path", async (_event, p) => {
  if (typeof p !== "string" || !path.isAbsolute(p)) return;
  const target = path.resolve(p);
  const roots = [defaultOutputDir(), ...allowedRoots];
  const inside = roots.some((root) => {
    const rel = path.relative(path.resolve(root), target);
    return !rel.startsWith("..") && !path.isAbsolute(rel);
  });
  if (inside) shell.showItemInFolder(target);
});

ipcMain.handle("webwrap:pick-icon", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "ico"] }],
  });
  if (result.canceled || result.filePaths.length === 0) return { ok: false };
  try {
    const file = result.filePaths[0];
    if ((await fs.stat(file)).size > 10 * 1024 * 1024) return { ok: false };
    const png = toSquarePng(await fs.readFile(file));
    return png ? { ok: true, iconDataUrl: toDataUrl(png) } : { ok: false };
  } catch {
    return { ok: false };
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Icon normalisation. electron-builder converts PNG to ico/icns itself,
// so all we need is a big, square PNG (>= 512px; we emit 1024).
// ─────────────────────────────────────────────────────────────────────────

const ICON_SIZE = 1024;

const toDataUrl = (png) => "data:image/png;base64," + png.toString("base64");

// Decode any image nativeImage understands; scale to fit, pad to a transparent square.
function toSquarePng(buf, size = ICON_SIZE) {
  let img = nativeImage.createFromBuffer(buf);
  if (img.isEmpty()) return null;
  const { width, height } = img.getSize();
  if (!width || !height) return null;
  const scale = size / Math.max(width, height);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  img = img.resize({ width: w, height: h, quality: "best" });
  if (w === size && h === size) return img.toPNG();

  const src = img.toBitmap(); // BGRA
  const dst = Buffer.alloc(size * size * 4); // transparent
  const ox = Math.floor((size - w) / 2);
  const oy = Math.floor((size - h) / 2);
  for (let y = 0; y < h; y++) {
    src.copy(dst, ((y + oy) * size + ox) * 4, y * w * 4, (y + 1) * w * 4);
  }
  return nativeImage.createFromBitmap(dst, { width: size, height: size }).toPNG();
}

// Keep a square PNG >= 512px as is; otherwise normalise. Falls back to null (generator default).
function normaliseIconDataUrl(dataUrl) {
  const png = pngFromDataUrl(dataUrl);
  if (!png) return null;
  const img = nativeImage.createFromBuffer(png);
  if (img.isEmpty()) return null;
  const { width, height } = img.getSize();
  if (width === height && width >= 512) return dataUrl;
  const out = toSquarePng(png);
  return out ? toDataUrl(out) : null;
}

// ─────────────────────────────────────────────────────────────────────────
// Validation and helpers
// ─────────────────────────────────────────────────────────────────────────

function parseHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}

// Trust boundary: the renderer's checks are not enough.
async function validatePayload(payload) {
  const p = payload || {};
  if (typeof p.url !== "string" || !parseHttpUrl(p.url.trim())) {
    throw new Error("Enter a valid http:// or https:// URL.");
  }
  const name = typeof p.name === "string" ? p.name.trim() : "";
  if (name.length < 2 || name.length > 80) {
    throw new Error("App name must be 2 to 80 characters.");
  }
  const description = typeof p.description === "string" ? p.description.trim() : "";
  if (description.length > 160) {
    throw new Error("Description must be 160 characters or fewer.");
  }
  if (typeof p.outputDir !== "string" || !path.isAbsolute(p.outputDir)) {
    throw new Error("Choose an output folder (absolute path).");
  }
  try {
    await fs.access(p.outputDir, fsConstants.W_OK);
  } catch {
    throw new Error("The output folder does not exist or is not writable.");
  }
  return {
    url: p.url.trim(),
    name,
    description,
    outputDir: p.outputDir,
    iconDataUrl: typeof p.iconDataUrl === "string" ? normaliseIconDataUrl(p.iconDataUrl) : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// URL inspection: page title and favicon for auto-fill. Never throws.
// ─────────────────────────────────────────────────────────────────────────

async function fetchCapped(url, timeoutMs, maxBytes) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    if (!res.ok || !res.body) throw new Error("bad response");
    const chunks = [];
    let total = 0;
    const reader = res.body.getReader();
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
    reader.cancel().catch(() => {});
    return { res, buf: Buffer.concat(chunks).subarray(0, maxBytes) };
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function pickIconHref(html) {
  const links = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = /\brel\s*=\s*["']?([^"'>]+)/i.exec(tag);
    const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    if (rel && href && /\bicon\b|apple-touch-icon/i.test(rel[1])) {
      links.push({
        apple: /apple-touch-icon/i.test(rel[1]),
        href: decodeEntities(href[1] ?? href[2]),
      });
    }
  }
  const best =
    links.find((l) => l.apple) || links.find((l) => /\.png(\?|$)/i.test(l.href)) || links[0];
  return best ? best.href : "/favicon.ico";
}

async function inspectUrl(url) {
  if (typeof url !== "string" || !parseHttpUrl(url.trim())) return { ok: false };
  const { res, buf } = await fetchCapped(url.trim(), 6000, 512 * 1024);
  const html = buf.toString("utf8");
  const t = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = t ? decodeEntities(t[1]).replace(/\s+/g, " ").trim() : "";

  let iconDataUrl = null;
  try {
    const iconUrl = new URL(pickIconHref(html), res.url || url);
    if (iconUrl.protocol === "http:" || iconUrl.protocol === "https:") {
      const icon = await fetchCapped(iconUrl.href, 3000, 1024 * 1024);
      const type = (icon.res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      // SVG is unsupported; anything else nativeImage can decode becomes a PNG.
      if (type !== "image/svg+xml" && !type.startsWith("text/")) {
        const png = toSquarePng(icon.buf);
        if (png) iconDataUrl = toDataUrl(png);
      }
    }
  } catch {
    // icon is optional
  }
  return { ok: true, title, iconDataUrl };
}

// ─────────────────────────────────────────────────────────────────────────
// Build environment + in-app build.
// Only the current OS is built: electron-builder cross-builds (mac from
// win/linux, win installers without wine) are unreliable, so target is
// 'current' only for now.
// ─────────────────────────────────────────────────────────────────────────

const isWin = process.platform === "win32";
const BUILD_TIMEOUT_MS = 20 * 60 * 1000;
const INSTALLER_EXTS = [".exe", ".dmg", ".deb", ".appimage"];

// Fixed args only; shell:true is needed for .cmd shims on Windows.
function runCapture(cmd, args) {
  return new Promise((resolve) => {
    let out = "";
    let child;
    try {
      child = spawn(cmd, args, { shell: isWin, windowsHide: true });
    } catch {
      return resolve(null);
    }
    child.stdout.on("data", (d) => (out += d));
    child.on("error", () => resolve(null));
    child.on("close", (code) => resolve(code === 0 ? out.trim() : null));
  });
}

ipcMain.handle("webwrap:check-build-env", async () => {
  const [node, npm] = await Promise.all([
    runCapture("node", ["--version"]),
    runCapture(isWin ? "npm.cmd" : "npm", ["--version"]),
  ]);
  if (!node || !npm) {
    const missing = [!node && "Node.js", !npm && "npm"].filter(Boolean).join(" and ");
    return {
      ok: false,
      node: node || undefined,
      npm: npm || undefined,
      message: `${missing} not found. Install Node.js (which includes npm) from https://nodejs.org, then restart WebWrap Studio.`,
    };
  }
  return { ok: true, node, npm };
});

async function validateProjectDir(dir) {
  if (typeof dir !== "string" || !path.isAbsolute(dir)) throw new Error("Invalid project folder.");
  const resolved = path.resolve(dir);
  for (const f of ["webwrap.config.json", "package.json"]) {
    try {
      await fs.access(path.join(resolved, f));
    } catch {
      throw new Error("That folder is not a WebWrap project.");
    }
  }
  return resolved;
}

async function newestInstaller(distDir) {
  let best = null;
  for (const name of await fs.readdir(distDir).catch(() => [])) {
    if (!INSTALLER_EXTS.includes(path.extname(name).toLowerCase())) continue;
    const full = path.join(distDir, name);
    const st = await fs.stat(full).catch(() => null);
    if (st && st.isFile() && (!best || st.mtimeMs > best.mtime)) best = { full, mtime: st.mtimeMs };
  }
  return best && best.full;
}

let build = null; // { child, cancelled }

function killTree(child) {
  if (isWin) spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true });
  else child.kill("SIGTERM");
}

function runStage(sender, dir, stage, cmd, args) {
  return new Promise((resolve, reject) => {
    const send = (line) => {
      if (!sender.isDestroyed()) sender.send("webwrap:build-log", { stage, line });
    };
    const child = spawn(cmd, args, { cwd: dir, shell: isWin, windowsHide: true });
    build.child = child;
    const timer = setTimeout(() => {
      build.timedOut = true;
      killTree(child);
    }, BUILD_TIMEOUT_MS - (Date.now() - build.started));
    let pending = "";
    const onData = (chunk) => {
      const lines = (pending + chunk).split(/\r\n|\n|\r/);
      pending = lines.pop();
      // eslint-disable-next-line no-control-regex
      for (const l of lines) if (l.trim()) send(l.replace(/\x1b\[[0-9;]*[A-Za-z]/g, ""));
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(new Error(`Could not start ${cmd}: ${e.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (pending.trim()) send(pending);
      if (build.cancelled) reject(new Error("Build cancelled."));
      else if (build.timedOut) reject(new Error("Build timed out after 20 minutes."));
      else if (code !== 0) reject(new Error(`${stage === "install" ? "npm install" : "electron-builder"} failed (exit code ${code}). See the log above.`));
      else resolve();
    });
  });
}

ipcMain.handle("webwrap:build-app", async (event, opts) => {
  if (build) return { ok: false, error: "A build is already running." };
  build = { child: null, cancelled: false, timedOut: false, started: Date.now() };
  try {
    if (!opts || (opts.target && opts.target !== "current")) {
      throw new Error("Only building for the current operating system is supported.");
    }
    const dir = await validateProjectDir(opts.projectDir);
    const flag = isWin ? "--win" : process.platform === "darwin" ? "--mac" : "--linux";
    await runStage(event.sender, dir, "install", isWin ? "npm.cmd" : "npm", ["install"]);
    await runStage(event.sender, dir, "build", isWin ? "npx.cmd" : "npx", ["electron-builder", flag]);
    const installerPath = await newestInstaller(path.join(dir, "dist"));
    if (!installerPath) throw new Error("The build finished but no installer was found in dist/.");
    allowedRoots.add(dir);
    return { ok: true, installerPath };
  } catch (error) {
    return { ok: false, error: error.message || "Build failed." };
  } finally {
    build = null;
  }
});

ipcMain.handle("webwrap:cancel-build", async () => {
  if (build && build.child) {
    build.cancelled = true;
    killTree(build.child);
  }
});
