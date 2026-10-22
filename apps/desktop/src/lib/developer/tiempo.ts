import { apiFetch } from "../api";

export interface EstadoTiempo {
  fecha: string;
  offsetMs: number;
}

export function obtenerEstadoTiempo() {
  return apiFetch<EstadoTiempo>("/dev/tiempo");
}

export function adelantarTiempo(dias: number) {
  return apiFetch<EstadoTiempo>("/dev/tiempo/adelantar", {
    method: "POST",
    body: JSON.stringify({ dias }),
  });
}

export function establecerTiempo(fecha: string) {
  return apiFetch<EstadoTiempo>("/dev/tiempo/establecer", {
    method: "POST",
    body: JSON.stringify({ fecha }),
  });
}

export function reiniciarTiempo() {
  return apiFetch<EstadoTiempo>("/dev/tiempo/reiniciar", {
    method: "POST",
  });
}
