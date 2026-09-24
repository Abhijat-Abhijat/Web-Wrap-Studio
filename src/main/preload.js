const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("webwrap", {
  selectFolder: () => ipcRenderer.invoke("webwrap:select-folder"),
  createProject: (payload) => ipcRenderer.invoke("webwrap:create-project", payload),
  openFolder: (folderPath) => ipcRenderer.invoke("webwrap:open-folder", folderPath),
});
