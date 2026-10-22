"use client";

import { useCallback, useState } from "react";

import { addToast } from "../../components/toast/use-toast";
import { getErrorMessage } from "../../lib/api";
import {
  limpiarDatos,
  type ResultadoLimpieza,
  type TipoLimpieza,
} from "../../lib/developer/limpieza";
import { emitirDatosActualizados } from "../../lib/eventos";

const mensajes: Record<TipoLimpieza, string> = {
  clientes:
    "Se eliminarán todos los clientes y sus cortes. Esta acción no se puede deshacer. ¿Continuar?",
  cajas:
    "Se eliminarán todas las cajas y se desvincularán de sus clientes. Esta acción no se puede deshacer. ¿Continuar?",
  zonas:
    "Se eliminarán todas las zonas y los clientes que dependen de ellas. Esta acción no se puede deshacer. ¿Continuar?",
  planes:
    "Se eliminarán todos los planes y los clientes que dependen de ellos. Esta acción no se puede deshacer. ¿Continuar?",
};

function resumir(tipo: TipoLimpieza, resultado: ResultadoLimpieza): string {
  const partes: string[] = [];

  if (resultado.clientes) partes.push(`${resultado.clientes} clientes`);
  if (resultado.cortes) partes.push(`${resultado.cortes} cortes`);
  if (resultado.cajas) partes.push(`${resultado.cajas} cajas`);
  if (resultado.zonas) partes.push(`${resultado.zonas} zonas`);
  if (resultado.planes) partes.push(`${resultado.planes} planes`);
  if (resultado.clientesDesasociados) {
    partes.push(`${resultado.clientesDesasociados} clientes desasociados`);
  }

  const detalle = partes.length ? ` (${partes.join(", ")})` : "";
  return `Limpieza de ${tipo} completada${detalle}`;
}

export function useDeveloperActions() {
  const [ejecutando, setEjecutando] = useState<TipoLimpieza | null>(null);

  const ejecutar = useCallback(
    async (tipo: TipoLimpieza, confirmar: () => boolean = () => true) => {
      if (ejecutando) return;
      if (!confirmar()) return;

      setEjecutando(tipo);
      try {
        const resultado = await limpiarDatos(tipo);
        emitirDatosActualizados();
        addToast(resumir(tipo, resultado), "success");
      } catch (error) {
        addToast(getErrorMessage(error, "No se pudo completar la limpieza"), "error");
      } finally {
        setEjecutando(null);
      }
    },
    [ejecutando],
  );

  const estaEjecutando = useCallback(
    (tipo: TipoLimpieza) => ejecutando === tipo,
    [ejecutando],
  );

  return {
    ejecutando,
    ejecutar,
    estaEjecutando,
    pedirConfirmacion: (tipo: TipoLimpieza) => mensajes[tipo],
  };
}
