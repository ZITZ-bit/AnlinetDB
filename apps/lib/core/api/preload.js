const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    minimize: () => ipcRenderer.send("minimize"),
    maximize: () => ipcRenderer.send("maximize"),
    close: () => ipcRenderer.send("close"),
    updateApp: () => ipcRenderer.invoke("update-app"),
    backupSave: (name) => ipcRenderer.invoke("backup:save", name),
    backupOpen: () => ipcRenderer.invoke("backup:open"),
    backupWrite: (path, content) => ipcRenderer.invoke("backup:write", path, content),
    backupRead: (path) => ipcRenderer.invoke("backup:read", path),
});
