const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("webwrap", {
  selectFolder: () => ipcRenderer.invoke("webwrap:select-folder"),
  getDefaultOutputDir: () => ipcRenderer.invoke("webwrap:default-output-dir"),
  inspectUrl: (url) => ipcRenderer.invoke("webwrap:inspect-url", url),
  createProject: (payload) => ipcRenderer.invoke("webwrap:create-project", payload),
  openFolder: (folderPath) => ipcRenderer.invoke("webwrap:open-folder", folderPath),
  checkBuildEnv: () => ipcRenderer.invoke("webwrap:check-build-env"),
  buildApp: (opts) => ipcRenderer.invoke("webwrap:build-app", opts),
  cancelBuild: () => ipcRenderer.invoke("webwrap:cancel-build"),
  revealPath: (p) => ipcRenderer.invoke("webwrap:reveal-path", p),
  pickIcon: () => ipcRenderer.invoke("webwrap:pick-icon"),
  onBuildLog: (cb) => {
    const handler = (_event, msg) => cb(msg);
    ipcRenderer.on("webwrap:build-log", handler);
    return () => ipcRenderer.removeListener("webwrap:build-log", handler);
  },
});
