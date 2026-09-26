const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("paneshell", {
  selectFolder: () => ipcRenderer.invoke("paneshell:select-folder"),
  getDefaultOutputDir: () => ipcRenderer.invoke("paneshell:default-output-dir"),
  inspectUrl: (url) => ipcRenderer.invoke("paneshell:inspect-url", url),
  createProject: (payload) => ipcRenderer.invoke("paneshell:create-project", payload),
  openFolder: (folderPath) => ipcRenderer.invoke("paneshell:open-folder", folderPath),
  checkBuildEnv: () => ipcRenderer.invoke("paneshell:check-build-env"),
  buildApp: (opts) => ipcRenderer.invoke("paneshell:build-app", opts),
  cancelBuild: () => ipcRenderer.invoke("paneshell:cancel-build"),
  revealPath: (p) => ipcRenderer.invoke("paneshell:reveal-path", p),
  getSettings: () => ipcRenderer.invoke("paneshell:get-settings"),
  setSettings: (p) => ipcRenderer.invoke("paneshell:set-settings", p),
  openRecent: (f) => ipcRenderer.invoke("paneshell:open-recent", f),
  regenerateData: (f) => ipcRenderer.invoke("paneshell:regenerate-data", f),
  copyReport: (t) => ipcRenderer.invoke("paneshell:copy-report", t),
  pickIcon: () => ipcRenderer.invoke("paneshell:pick-icon"),
  onBuildLog: (cb) => {
    const handler = (_event, msg) => cb(msg);
    ipcRenderer.on("paneshell:build-log", handler);
    return () => ipcRenderer.removeListener("paneshell:build-log", handler);
  },
});
