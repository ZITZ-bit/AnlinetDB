"use client";

import { useEffect, useMemo, useState } from "react";

import { useRefrescarDatos } from "../../hooks/datos/useRefrescarDatos";
import { api, type Cliente, type Corte } from "../api";
import { coincideUsuarioOCedula, coincideZonaOCaja, normalizar } from "./busqueda";
import { mesDePeriodo } from "../corte";
import { etiquetasEstado, todosLosValores, type ResumenEtiqueta } from "./etiquetas";
import { TablaMeses } from "./meses";

export function useTablaDatos(mesesAMostrar: string[]) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cortes, setCortes] = useState<Corte[]>([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>(todosLosValores());
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [busquedaZonaCaja, setBusquedaZonaCaja] = useState("");

  const cargarDatos = () => {
    api.clientes.getAll().then(setClientes).catch(() => setClientes([]));
    api.cortes.getAll().then(setCortes).catch(() => setCortes([]));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useRefrescarDatos(cargarDatos);

  const guardarCorte = (actualizado: Corte) => {
    setCortes((actuales) => [
      ...actuales.filter((corte) => corte.id !== actualizado.id),
      actualizado,
    ]);
  };

  const actualizarCliente = (actualizado: Cliente) => {
    setClientes((actuales) =>
      actuales.map((cliente) => (cliente.id === actualizado.id ? actualizado : cliente)),
    );
  };

  const eliminarCliente = (id: number) => {
    setClientes((actuales) => actuales.filter((cliente) => cliente.id !== id));
  };

  const cortesPorCliente = useMemo(() => {
    const mapa = new Map<number, Corte[]>();

    for (const corte of cortes) {
      const lista = mapa.get(corte.clienteId) ?? [];
      lista.push(corte);
      mapa.set(corte.clienteId, lista);
    }

    for (const lista of mapa.values()) {
      lista.sort((a, b) => String(b.periodo).localeCompare(String(a.periodo)));
    }

    return mapa;
  }, [cortes]);

  const resumenEtiquetas = useMemo<ResumenEtiqueta[]>(
    () =>
      etiquetasEstado.map((etiqueta) => ({
        ...etiqueta,
        cantidad: new Set(
          cortes
            .filter((corte) => corte.estado === etiqueta.value)
            .map((corte) => corte.clienteId),
        ).size,
      })),
    [cortes],
  );

  const etiquetasActivas =
    etiquetasSeleccionadas.length === etiquetasEstado.length
      ? []
      : resumenEtiquetas.filter((etiqueta) => etiquetasSeleccionadas.includes(etiqueta.value));

  const toggleEtiqueta = (value: string) => {
    setEtiquetasSeleccionadas((actuales) =>
      actuales.includes(value)
        ? actuales.filter((etiqueta) => etiqueta !== value)
        : [...actuales, value],
    );
  };

  const corteDelMes = (clienteId: number, mes: number) =>
    (cortesPorCliente.get(clienteId) ?? []).find(
      (corte) => mesDePeriodo(corte.periodo) === mes,
    );

  const fechaCorteCliente = (cliente: Cliente) => {
    const lista = cortesPorCliente.get(cliente.id) ?? [];
    const corte = lista[0];
    if (!corte?.fechaVencimiento) return "-";
    return new Date(corte.fechaVencimiento).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const consultaUsuario = normalizar(busquedaUsuario);
  const consultaZonaCaja = normalizar(busquedaZonaCaja);

  const clientesFiltrados = clientes.filter((cliente) => {
    if (consultaUsuario && !coincideUsuarioOCedula(cliente, consultaUsuario)) return false;
    if (consultaZonaCaja && !coincideZonaOCaja(cliente, consultaZonaCaja)) return false;
    if (etiquetasSeleccionadas.length === etiquetasEstado.length) return true;
    return mesesAMostrar.some((mes) => {
      const corte = corteDelMes(cliente.id, TablaMeses.indexOf(mes) + 1);
      if (!corte) return false;
      const estado = corte.estado === "pendiente" ? "pendiente_manual" : corte.estado;
      return etiquetasSeleccionadas.includes(estado);
    });
  });

  return {
    clientes,
    cortes,
    clientesFiltrados,
    resumenEtiquetas,
    etiquetasActivas,
    etiquetasSeleccionadas,
    setEtiquetasSeleccionadas,
    toggleEtiqueta,
    busquedaUsuario,
    setBusquedaUsuario,
    busquedaZonaCaja,
    setBusquedaZonaCaja,
    corteDelMes,
    fechaCorteCliente,
    guardarCorte,
    actualizarCliente,
    eliminarCliente,
  };
}
