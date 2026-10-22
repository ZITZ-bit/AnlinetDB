/**
 * Prepara el runtime autocontenido de la API NestJS para empaquetarlo junto a
 * la app de escritorio.
 *
 * Genera `apps/api/runtime` con:
 *  - dist/ (API compilada)
 *  - prisma/ (schema y base SQLite inicial)
 *  - node_modules/ solo de produccion (sin el CLI de Prisma)
 *  - node.exe (el mismo Node con el que se compilaron los modulos nativos)
 *
 * Despues poda archivos que no se usan en runtime (source maps, tipos, WASM
 * de otras bases de datos, etc.) para reducir el peso del instalador.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const desktopDir = path.join(__dirname, "..");
const repoRoot = path.join(desktopDir, "..", "..");
const apiDir = path.join(repoRoot, "apps", "api");
const runtimeDir = path.join(apiDir, "runtime");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

// En Windows, Node 24 no permite spawnear .cmd directamente. Preferimos
// invocar el CLI de npm con el mismo Node que ejecuta este script.
const nodeCliDir = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin");
const npmCli = path.join(nodeCliDir, "npm-cli.js");
const npxCli = path.join(nodeCliDir, "npx-cli.js");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runCli(cli, command, args, options = {}) {
  if (fs.existsSync(cli)) {
    run(process.execPath, [cli, ...args], options);
    return;
  }

  run(command, args, { ...options, shell: process.platform === "win32" });
}

function remove(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function dirSize(dir) {
  let total = 0;

  if (!fs.existsSync(dir)) {
    return total;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    total += entry.isDirectory()
      ? dirSize(fullPath)
      : fs.statSync(fullPath).size;
  }

  return total;
}

function findDirectories(root, name) {
  const found = [];

  if (!fs.existsSync(root)) {
    return found;
  }

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const fullPath = path.join(root, entry.name);

    if (entry.name === name) {
      found.push(fullPath);
    }

    found.push(...findDirectories(fullPath, name));
  }

  return found;
}

// 1. Compilar la API (prisma generate + nest build).
runCli(npmCli, npm, ["run", "build", "--workspace=api"], { cwd: repoRoot });

// 2. Crear el runtime con un package.json minimo de dependencias de produccion.
const apiPackage = JSON.parse(
  fs.readFileSync(path.join(apiDir, "package.json"), "utf8"),
);

const dependencies = { ...apiPackage.dependencies };
// El CLI de Prisma solo se usa para generar/administrar la base, no en runtime.
delete dependencies.prisma;

remove(runtimeDir);
fs.mkdirSync(runtimeDir, { recursive: true });
fs.writeFileSync(
  path.join(runtimeDir, "package.json"),
  `${JSON.stringify(
    {
      name: "anlinetdb-api-runtime",
      version: apiPackage.version,
      private: true,
      dependencies,
      allowScripts: {
        bcrypt: true,
        "better-sqlite3": true,
      },
    },
    null,
    2,
  )}\n`,
);

// 3. Instalar dependencias de produccion.
runCli(npmCli, npm, ["install", "--omit=dev", "--no-audit", "--no-fund"], {
  cwd: runtimeDir,
});

// 4. Copiar la API compilada, el schema/base y el runtime de Node.
fs.cpSync(path.join(apiDir, "dist"), path.join(runtimeDir, "dist"), {
  recursive: true,
});

const databasePath = path.join(apiDir, "prisma", "database", "dev.db");

if (!fs.existsSync(databasePath)) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  runCli(
    npxCli,
    npx,
    [
      "prisma",
      "db",
      "push",
      "--config",
      "prisma/prisma.config.ts",
      "--skip-generate",
    ],
    { cwd: apiDir },
  );
}

fs.cpSync(path.join(apiDir, "prisma"), path.join(runtimeDir, "prisma"), {
  recursive: true,
});

const nodeBinary = path.join(runtimeDir, "node.exe");
fs.copyFileSync(process.execPath, nodeBinary);

const nodeDir = path.dirname(process.execPath);
for (const licenseName of ["LICENSE", "LICENSE.md"]) {
  const licensePath = path.join(nodeDir, licenseName);
  if (fs.existsSync(licensePath)) {
    fs.copyFileSync(licensePath, path.join(runtimeDir, "NODE_LICENSE.txt"));
    break;
  }
}

// 5. Podar archivos innecesarios para runtime.
remove(path.join(runtimeDir, "node_modules", "@types"));
remove(path.join(runtimeDir, "node_modules", ".bin"));
remove(path.join(runtimeDir, "node_modules", ".package-lock.json"));

// Prisma incluye el compilador WASM de cada motor de base de datos. Solo se usa SQLite.
const prismaRuntime = path.join(
  runtimeDir,
  "node_modules",
  "@prisma",
  "client",
  "runtime",
);

if (fs.existsSync(prismaRuntime)) {
  for (const file of fs.readdirSync(prismaRuntime)) {
    if (
      /^query_compiler_(fast|small)_bg\.(cockroachdb|mysql|postgresql|sqlserver)\.wasm-base64\.(js|mjs)$/.test(
        file,
      )
    ) {
      fs.rmSync(path.join(prismaRuntime, file), { force: true });
    }
  }
}

// better-sqlite3 trae el codigo fuente de SQLite; en runtime solo se necesita el binario.
for (const betterSqliteDir of findDirectories(runtimeDir, "better-sqlite3")) {
  for (const folder of [
    "deps",
    "src",
    "benchmark",
    "docs",
    "test",
    ".github",
  ]) {
    remove(path.join(betterSqliteDir, folder));
  }
}

// bcrypt solo necesita el prebuild de Windows x64.
const bcryptDir = path.join(runtimeDir, "node_modules", "bcrypt");
const bcryptPrebuilds = path.join(bcryptDir, "prebuilds");

if (fs.existsSync(bcryptPrebuilds)) {
  for (const entry of fs.readdirSync(bcryptPrebuilds, {
    withFileTypes: true,
  })) {
    if (entry.isDirectory() && entry.name !== "win32-x64") {
      remove(path.join(bcryptPrebuilds, entry.name));
    }
  }
}

for (const folder of ["src", "test", "examples", ".github"]) {
  remove(path.join(bcryptDir, folder));
}

// Archivos que no aportan nada en runtime.
const dropFile = (file) =>
  file.endsWith(".map") ||
  file.endsWith(".d.ts") ||
  file.endsWith(".d.mts") ||
  file.endsWith(".d.cts") ||
  file.endsWith(".pdb") ||
  ["README.md", "CHANGELOG.md", "HISTORY.md", ".npmignore"].includes(
    path.basename(file),
  );

function pruneFiles(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      pruneFiles(fullPath);
    } else if (dropFile(entry.name)) {
      fs.rmSync(fullPath, { force: true });
    }
  }
}

pruneFiles(path.join(runtimeDir, "node_modules"));

console.log(
  `[prepare-api-runtime] API runtime listo: ${(dirSize(runtimeDir) / 1024 / 1024).toFixed(1)} MB`,
);
