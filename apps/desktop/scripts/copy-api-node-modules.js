const fs = require("fs");
const path = require("path");

const desktopDir = path.join(__dirname, "..");
const from = path.join(desktopDir, "..", "api", "runtime", "node_modules");
const to = path.join(desktopDir, "release", "win-unpacked", "resources", "api", "node_modules");

if (!fs.existsSync(from)) {
  console.error("[copy-api-node-modules] runtime/node_modules no existe");
  process.exit(1);
}

fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(from, to, { recursive: true });
console.log("[copy-api-node-modules] node_modules copiado al release");
