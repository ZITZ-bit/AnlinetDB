const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

function getLibPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "lib");
  }
  return path.join(__dirname, "..", "..", "lib");
}

require(path.join(getLibPath(), "core", "scripts", "windowControls.js"));

let mainWindow;
let splash;
let nextProcess;
let apiProcess;

function waitForServer(port, retries = 50) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    const check = () => {
      const req = http.request(`http://127.0.0.1:${port}/`, (res) => {
        if (res.statusCode < 500) {
          resolve();
        } else {
          attempt++;
          if (attempt >= retries) {
            reject(new Error(`Server on port ${port} did not start in time`));
          } else {
            setTimeout(check, 200);
          }
        }
      });
      req.on("error", () => {
        attempt++;
        if (attempt >= retries) {
          reject(new Error(`Server on port ${port} did not start in time`));
        } else {
          setTimeout(check, 200);
        }
      });
      req.end();
    };
    check();
  });
}

function getStandaloneDir() {
  if (app.isPackaged) {
    // El standalone se desempaqueta fuera del asar para que Node pueda leerlo.
    return path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      ".next",
      "standalone",
      "apps",
      "desktop",
    );
  }
  return path.join(__dirname, "..", ".next", "standalone", "apps", "desktop");
}

function startNextServer(port) {
  return new Promise((resolve, reject) => {
    const standaloneDir = getStandaloneDir();
    const serverPath = path.join(standaloneDir, "server.js");

    // Usamos el Node embebido en Electron (no requiere Node instalado en el equipo).
    nextProcess = spawn(process.execPath, [serverPath], {
      stdio: "inherit",
      cwd: standaloneDir,
      windowsHide: true,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        PORT: String(port),
        HOSTNAME: "127.0.0.1",
      },
    });

    nextProcess.on("error", (err) => {
      reject(err);
    });

    waitForServer(port)
      .then(() => resolve())
      .catch((err) => reject(err));
  });
}

function getApiDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "api");
  }
  return path.join(__dirname, "..", "..", "api");
}

function startApiServer(port) {
  return new Promise((resolve, reject) => {
    const apiDir = getApiDir();
    const nodeExe = path.join(apiDir, "node.exe");
    const serverPath = path.join(apiDir, "dist", "main.js");

    // La base de datos vive en userData para que sea escribible y persista
    // entre actualizaciones. En el primer arranque se copia la base incluida.
    const dataDir = path.join(app.getPath("userData"), "data");
    fs.mkdirSync(dataDir, { recursive: true });

    const databasePath = path.join(dataDir, "anlinet.db");
    if (!fs.existsSync(databasePath)) {
      fs.copyFileSync(
        path.join(apiDir, "prisma", "database", "dev.db"),
        databasePath,
      );
    }

    apiProcess = spawn(nodeExe, [serverPath], {
      stdio: "inherit",
      cwd: apiDir,
      windowsHide: true,
      env: {
        ...process.env,
        PORT: String(port),
        HOST: "127.0.0.1",
        DATABASE_URL: `file:${databasePath}`,
      },
    });

    apiProcess.on("error", (err) => {
      reject(err);
    });

    waitForServer(port)
      .then(() => resolve())
      .catch((err) => reject(err));
  });
}

function createWindow() {
  const libPath = getLibPath();

  splash = new BrowserWindow({
    width: 120,
    height: 120,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    icon: path.join(libPath, "assets", "icons", "icon.ico"),
  });

  splash.loadFile(path.join(libPath, "assets", "views", "splash.html"));

  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    autoHideMenuBar: true,
    frame: false,
    show: false,
    icon: path.join(libPath, "assets", "icons", "icon.ico"),
    webPreferences: {
      preload: path.join(libPath, "core", "api", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    const PORT = process.env.NEXT_PORT || 3000;
    const API_PORT = process.env.API_PORT || 3002;
    Promise.all([startNextServer(PORT), startApiServer(API_PORT)])
      .then(() => {
        mainWindow.loadURL(`http://localhost:${PORT}`);
      })
      .catch((err) => {
        console.error("Failed to start application servers:", err.message);
        app.quit();
      });
  } else {
    mainWindow.loadURL("http://localhost:3000");
  }

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
  ipcMain.handle("backup:save", async (_e, defaultName) => {
    const r = await dialog.showSaveDialog(mainWindow, { defaultPath: defaultName || "backup.json", filters: [{ name: "JSON", extensions: ["json"] }] });
    return r;
  });
  ipcMain.handle("backup:open", async () => {
    const r = await dialog.showOpenDialog(mainWindow, { filters: [{ name: "JSON", extensions: ["json"] }], properties: ["openFile"] });
    return r;
  });
  ipcMain.handle("backup:write", async (_e, filePath, content) => {
    const fs = require("fs");
    fs.writeFileSync(filePath, content, "utf-8");
    return { ok: true };
  });
  ipcMain.handle("backup:read", async (_e, filePath) => {
    const fs = require("fs");
    return fs.readFileSync(filePath, "utf-8");
  });
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (nextProcess) {
    nextProcess.kill();
  }
  if (apiProcess) {
    apiProcess.kill();
  }
});
