const { ipcMain, BrowserWindow } = require("electron");

ipcMain.on("minimize", () => {
    BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on("maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    win.isMaximized() ? win.unmaximize() : win.maximize();
});

ipcMain.on("close", () => {
    BrowserWindow.getFocusedWindow().close();
});