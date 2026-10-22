import { apiFetch } from "../api";

export type TipoLimpieza = "clientes" | "cajas" | "zonas" | "planes";

export interface ResultadoLimpieza {
  clientes?: number;
  cortes?: number;
  cajas?: number;
  zonas?: number;
  planes?: number;
  clientesDesasociados?: number;
}

export function limpiarDatos(tipo: TipoLimpieza) {
  return apiFetch<ResultadoLimpieza>(`/${tipo}/limpieza`, { method: "DELETE" });
}
