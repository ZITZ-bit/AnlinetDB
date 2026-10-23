#!/usr/bin/env node
/**
 * Libera puertos que hayan quedado ocupados por procesos de AnlinetDB.
 *
 * Casos tipicos:
 *  - Un `next dev` / `nest start --watch` huerfano de una ejecucion anterior.
 *    Pasa en Windows cuando turbo/concurrently se cortan de golpe y el hijo
 *    de Next sigue vivo con el puerto tomado (EADDRINUSE).
 *  - La app instalada (AnlinetDB.exe) abierta, que tambien escucha en 3000/3002.
 *
 * Uso:
 *   node scripts/free-port.js 3000
 *   node scripts/free-port.js 3000 3002
 *
 * Seguridad: solo termina procesos del stack de la app (node, next, nest,
 * electron, AnlinetDB). Si el puerto lo ocupa cualquier otro programa, avisa
 * y sale con codigo 1 sin matar nada.
 */
const { execFileSync } = require("node:child_process");

const IS_WINDOWS = process.platform === "win32";
const PREFIX = "[free-port]";
const KILLABLE = /(^|[\\/\s"])(node|node\.exe|electron|electron\.exe|anlinetdb|anlinetdb\.exe)("|\s|$)/i;
const KILLABLE_HINTS = /\b(next|nest|turbopack|start-server|electron|anlinetdb)\b/i;

const ports = [
  ...new Set(
    process.argv
      .slice(2)
      .map(Number)
      .filter((port) => Number.isInteger(port) && port > 0 && port < 65536),
  ),
];

if (ports.length === 0) {
  console.error(`${PREFIX} Uso: node scripts/free-port.js <puerto> [puerto...]`);
  process.exit(1);
}

function log(message) {
  console.log(`${PREFIX} ${message}`);
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function safeExec(file, args) {
  try {
    return execFileSync(file, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    });
  } catch {
    return "";
  }
}

/** PIDs que estan escuchando en el puerto indicado. */
function listeningPids(port) {
  if (IS_WINDOWS) {
    const out = safeExec("netstat", ["-ano", "-p", "TCP"]);
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const cols = line.trim().split(/\s+/);
      if (cols.length < 5 || cols[3].toUpperCase() !== "LISTENING") continue;
      if (!cols[1].endsWith(`:${port}`)) continue;
      const pid = Number(cols[4]);
      if (Number.isInteger(pid) && pid > 0) pids.add(pid);
    }
    return [...pids];
  }

  const out = safeExec("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"]);
  return [
    ...new Set(
      out
        .split(/\s+/)
        .map(Number)
        .filter((pid) => Number.isInteger(pid) && pid > 0),
    ),
  ];
}

/** Mapa pid -> linea de comando. */
function commandLines(pids) {
  const map = new Map();
  if (pids.length === 0) return map;

  if (IS_WINDOWS) {
    const filter = pids.join(",");
    const script =
      `Get-CimInstance Win32_Process | Where-Object { @(${filter}) -contains $_.ProcessId } ` +
      `| ForEach-Object { "{0}|{1}" -f $_.ProcessId, $_.CommandLine }`;
    const out = safeExec("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      script,
    ]);
    for (const line of out.split(/\r?\n/)) {
      const index = line.indexOf("|");
      if (index <= 0) continue;
      const pid = Number(line.slice(0, index).trim());
      if (Number.isInteger(pid)) map.set(pid, line.slice(index + 1).trim());
    }
    return map;
  }

  const out = safeExec("ps", ["-o", "pid=", "-o", "command=", "-p", pids.join(",")]);
  for (const line of out.split(/\r?\n/)) {
    const match = line.trim().match(/^(\d+)\s+(.*)$/);
    if (match) map.set(Number(match[1]), match[2]);
  }
  return map;
}

function isOwnProcess(pid) {
  return pid === process.pid || pid === process.ppid;
}

function isOursBeyondDoubt(pid, cmd) {
  if (isOwnProcess(pid)) return false;
  if (KILLABLE.test(cmd)) return true;
  return KILLABLE_HINTS.test(cmd);
}

function killTree(pid) {
  if (IS_WINDOWS) {
    return safeExec("taskkill", ["/PID", String(pid), "/T", "/F"]) !== null;
  }

  // Unix: matar hijos primero y luego el proceso.
  const children = safeExec("pgrep", ["-P", String(pid)])
    .split(/\s+/)
    .map(Number)
    .filter((child) => Number.isInteger(child) && child > 0);
  for (const child of children) killTree(child);
  try {
    process.kill(pid, "SIGKILL");
  } catch {
    // El proceso ya no existe.
  }
  return true;
}

let failed = false;

for (const port of ports) {
  const pids = listeningPids(port);

  if (pids.length === 0) {
    log(`puerto ${port} libre.`);
    continue;
  }

  const commands = commandLines(pids);
  const ours = [];
  const foreign = [];

  for (const pid of pids) {
    const cmd = commands.get(pid) ?? "";
    if (isOursBeyondDoubt(pid, cmd)) {
      ours.push({ pid, cmd });
    } else {
      foreign.push({ pid, cmd });
    }
  }

  for (const { pid, cmd } of ours) {
    const label = cmd ? cmd.slice(0, 110) : "(sin linea de comandos)";
    log(`puerto ${port}: cerrando PID ${pid} -> ${label}`);
    killTree(pid);
  }

  // Esperar a que el sistema libere el socket.
  for (let attempt = 0; attempt < 25 && listeningPids(port).length > 0; attempt += 1) {
    sleep(200);
  }

  const remaining = listeningPids(port);
  if (remaining.length === 0) {
    log(`puerto ${port} liberado.`);
    continue;
  }

  failed = true;
  for (const { pid, cmd } of foreign) {
    console.error(
      `${PREFIX} puerto ${port} ocupado por otro programa (PID ${pid}): ${cmd || "desconocido"}`,
    );
  }
  for (const pid of remaining) {
    if (!foreign.some((item) => item.pid === pid)) {
      console.error(`${PREFIX} puerto ${port} sigue ocupado por el PID ${pid}.`);
    }
  }
  console.error(
    `${PREFIX} cierra ese programa manualmente y vuelve a intentarlo. No se cerro nada ajeno.`,
  );
}

process.exit(failed ? 1 : 0);
