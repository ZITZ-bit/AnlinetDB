/**
 * Next.js "output: standalone" no copia automaticamente la carpeta `public`
 * ni `.next/static` dentro del standalone. Sin esos archivos el servidor
 * empaquetado responde 404 para CSS/JS y la app se ve sin estilos.
 *
 * Este script se ejecuta despues de `next build` y deja el standalone
 * completo, listo para que electron-builder lo empaquete.
 */
const fs = require("fs");
const path = require("path");

const projectDir = path.join(__dirname, "..");
const standaloneAppDir = path.join(
  projectDir,
  ".next",
  "standalone",
  "apps",
  "desktop",
);

function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    return false;
  }

  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
  return true;
}

if (!fs.existsSync(standaloneAppDir)) {
  console.error(
    `[prepare-standalone] No se encontro el standalone en: ${standaloneAppDir}`,
  );
  process.exit(1);
}

const copiedStatic = copyDir(
  path.join(projectDir, ".next", "static"),
  path.join(standaloneAppDir, ".next", "static"),
);

if (!copiedStatic) {
  console.error(
    "[prepare-standalone] No se encontro .next/static para copiar al standalone.",
  );
  process.exit(1);
}

copyDir(
  path.join(projectDir, "public"),
  path.join(standaloneAppDir, "public"),
);

// Los source maps no se usan en produccion y suman peso innecesario.
function removeSourceMaps(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      removeSourceMaps(fullPath);
    } else if (entry.name.endsWith(".map")) {
      fs.rmSync(fullPath, { force: true });
    }
  }
}

removeSourceMaps(path.join(projectDir, ".next", "standalone"));

console.log("[prepare-standalone] Standalone listo para empaquetar.");
