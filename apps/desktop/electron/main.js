const { app, BrowserWindow } = require("electron");
const path = require("path");
require(path.join(__dirname, "..", "..", "lib", "core", "scripts", "windowControls.js"));

let mainWindow;
let splash;

function createWindow() {
  splash = new BrowserWindow({
    width: 120,
    height: 120,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    icon: path.join(__dirname, "..", "..", "lib", "assets", "icons", "icon.ico"),
  });

  splash.loadFile(path.join(__dirname, "..", "..", "lib", "assets", "views", "splash.html"));

  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    icon: path.join(__dirname, "..", "..", "lib", "assets", "icons", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "..", "..", "lib", "core", "api", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");

  mainWindow.once("ready-to-show", () => {
    splash.destroy();
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (!app.isQuiting) {
      app.quit();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
