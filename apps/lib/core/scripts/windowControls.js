const { ipcMain, BrowserWindow } = require("electron");
const { exec } = require("child_process");

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

ipcMain.handle("update-app", () => {
    return new Promise((resolve) => {
        const repoUrl = "https://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@github.com/ZITZ-bit/AnlinetDB.git";
        const cwd = process.cwd();
        exec(`git -C "${cwd}" pull "${repoUrl}" main`, (err, stdout, stderr) => {
            if (err) resolve({ ok: false, error: stderr || err.message });
            else resolve({ ok: true, output: stdout });
        });
    });
});