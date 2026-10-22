export const EVENTO_DATOS_ACTUALIZADOS = "anlinet:datos-actualizados";

export function emitirDatosActualizados() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENTO_DATOS_ACTUALIZADOS));
}
