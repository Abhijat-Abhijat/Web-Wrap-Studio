const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs/promises");

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

ipcMain.handle("webwrap:create-project", async (_event, payload) => {
  try {
    const projectDir = await generateProject(payload);
    return { ok: true, projectDir };
  } catch (error) {
    return { ok: false, error: error.message || "Failed to create the project." };
  }
});

ipcMain.handle("webwrap:open-folder", async (_event, folderPath) => {
  await shell.openPath(folderPath);
});

// ─────────────────────────────────────────────────────────────────────────
// Project generator — scaffolds a standalone, installer-ready Electron app
// that loads the given URL. The generated project ships with its own
// electron-builder config, so it can be built into .exe / .deb / .dmg too.
// ─────────────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "webwrapped-app";
}

async function generateProject({ url, name, description, outputDir }) {
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
      electron: "^32.0.0",
      "electron-builder": "^25.0.0",
    },
    build: {
      appId: `com.webwrap.${slug}`,
      productName: name,
      directories: { output: "dist" },
      files: ["main.js", "preload.js", "index.html"],
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

  await fs.writeFile(path.join(projectDir, "main.js"), wrappedMainTemplate(url, name));
  await fs.writeFile(path.join(projectDir, "preload.js"), wrappedPreloadTemplate());
  await fs.writeFile(path.join(projectDir, "index.html"), wrappedIndexTemplate(name));
  await fs.writeFile(
    path.join(projectDir, "README.md"),
    wrappedReadmeTemplate(name, slug)
  );

  return projectDir;
}

function wrappedMainTemplate(url, name) {
  return `const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: ${JSON.stringify(name)},
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(${JSON.stringify(url)});
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
`;
}

function wrappedPreloadTemplate() {
  return `// Reserved for future bridged APIs. Intentionally empty —
// the wrapped site runs with no Node access, by design.
`;
}

function wrappedIndexTemplate(name) {
  return `<!doctype html>
<html>
<head><meta charset="UTF-8"><title>${name}</title></head>
<body>
  <!-- main.js loads the target URL directly; this file is unused
       unless you switch main.js to loadFile for a local shell instead. -->
</body>
</html>
`;
}

function wrappedReadmeTemplate(name, slug) {
  return `# ${name}

Generated by WebWrap Studio.

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
