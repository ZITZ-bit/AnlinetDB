"use client";

import { useCallback, useEffect, useState } from "react";

import { addToast } from "../../components/toast/use-toast";
import { getErrorMessage } from "../../lib/api";
import {
  adelantarTiempo,
  establecerTiempo,
  obtenerEstadoTiempo,
  reiniciarTiempo,
  type EstadoTiempo,
} from "../../lib/developer/tiempo";
import { emitirDatosActualizados } from "../../lib/eventos";

export function useDeveloperTiempo() {
  const [estado, setEstado] = useState<EstadoTiempo | null>(null);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(() => {
    obtenerEstadoTiempo()
      .then(setEstado)
      .catch(() => setEstado(null));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const adelantar = useCallback(
    async (dias: number) => {
      if (cargando) return;
      setCargando(true);
      try {
        const resultado = await adelantarTiempo(dias);
        setEstado(resultado);
        emitirDatosActualizados();
        addToast(
          `Fecha simulada: ${new Date(resultado.fecha).toLocaleString("es-ES")} (+${dias} día${dias === 1 ? "" : "s"})`,
          "success",
        );
      } catch (error) {
        addToast(getErrorMessage(error, "No se pudo adelantar la fecha"), "error");
      } finally {
        setCargando(false);
      }
    },
    [cargando],
  );

  const establecer = useCallback(
    async (fecha: string) => {
      if (cargando) return;
      setCargando(true);
      try {
        const resultado = await establecerTiempo(fecha);
        setEstado(resultado);
        emitirDatosActualizados();
        addToast(`Fecha simulada: ${new Date(resultado.fecha).toLocaleString("es-ES")}`, "success");
      } catch (error) {
        addToast(getErrorMessage(error, "No se pudo establecer la fecha"), "error");
      } finally {
        setCargando(false);
      }
    },
    [cargando],
  );

  const reiniciar = useCallback(async () => {
    if (cargando) return;
    setCargando(true);
    try {
      const resultado = await reiniciarTiempo();
      setEstado(resultado);
      emitirDatosActualizados();
      addToast("Fecha simulada reiniciada", "success");
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo reiniciar la fecha"), "error");
    } finally {
      setCargando(false);
    }
  }, [cargando]);

  return { estado, cargando, adelantar, establecer, reiniciar, cargar };
}
