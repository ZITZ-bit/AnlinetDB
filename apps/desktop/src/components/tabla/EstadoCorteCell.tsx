"use client";

import { useRef, useState } from "react";

import { api, getErrorMessage, type Cliente, type Corte } from "../../lib/api";
import { addToast } from "../toast/use-toast";
import { DropdownMenu } from "./DropdownMenu";
import { etiquetasEstado } from "../../lib/tabla/etiquetas";
import "../../styles/estado-badge.css";
import "./tabla.css";

interface EstadoCorteCellProps {
  cliente: Cliente;
  mes: number;
  corte?: Corte;
  onSave: (corte: Corte) => void;
}

export function EstadoCorteCell({ cliente, mes, corte, onSave }: EstadoCorteCellProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const estado = corte?.estado || "pendiente";
  const etiqueta = etiquetasEstado.find((item) => item.value === estado);
  const fechaVencimiento = corte?.fechaVencimiento
    ? new Date(`${corte.fechaVencimiento.slice(0, 10)}T00:00:00`).toLocaleDateString("es-ES")
    : null;

  const guardarEstado = async (estadoSeleccionado: string) => {
    if (guardando) return;
    setGuardando(true);

    try {
      const fecha = new Date();
      const anio = fecha.getFullYear();
      const periodo = `${anio}-${String(mes).padStart(2, "0")}`;
      const corteGuardado = corte
        ? await api.cortes.update(corte.id, { estado: estadoSeleccionado })
        : await api.cortes.create({
            clienteId: cliente.id,
            monto: cliente.plan?.precio ?? 0,
            periodo,
            fechaVencimiento: new Date().toISOString(),
            estado: estadoSeleccionado,
          });

      onSave(corteGuardado);
      setMenuAbierto(false);
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo actualizar la etiqueta"), "error");
    } finally {
      setGuardando(false);
    }
  };

  const quitarEtiqueta = async () => {
    if (!corte) {
      setMenuAbierto(false);
      return;
    }

    if (guardando) return;
    setGuardando(true);

    try {
      const corteActualizado = await api.cortes.update(corte.id, { estado: "pendiente" });
      onSave(corteActualizado);
      setMenuAbierto(false);
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo quitar la etiqueta"), "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="dashboard-month-cell">
      <div className="dashboard-month-content">
        {corte && fechaVencimiento ? (
          <time className="dashboard-month-date" dateTime={corte.fechaVencimiento ?? undefined}>
            {fechaVencimiento}
          </time>
        ) : corte && estado !== "pendiente" ? (
          <span className="estado-badge" data-state={estado}>
            {etiqueta?.label ?? estado}
          </span>
        ) : null}
      </div>
      <button
        ref={buttonRef}
        type="button"
        className="dashboard-month-state-trigger"
        aria-label="Cambiar etiqueta del mes"
        aria-expanded={menuAbierto}
        disabled={guardando}
        onClick={() => setMenuAbierto((abierto) => !abierto)}
      >
        <i className="bx bx-chevron-down" />
      </button>
      {menuAbierto && (
        <DropdownMenu buttonRef={buttonRef} onClose={() => setMenuAbierto(false)}>
          <div className="dashboard-state-menu" aria-label="Etiquetas del mes">
            <button
              type="button"
              className="dashboard-state-option dashboard-state-option-clear"
              disabled={guardando}
              onClick={quitarEtiqueta}
            >
              <i className="bx bx-x-circle dashboard-state-icon" aria-hidden="true" />
              Ninguno
            </button>
            {etiquetasEstado.map((item) => (
              <button
                key={item.value}
                type="button"
                className="dashboard-state-option"
                data-state={item.value}
                disabled={guardando}
                onClick={() => guardarEstado(item.value)}
              >
                <i className="bx bx-purchase-tag dashboard-state-icon" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
        </DropdownMenu>
      )}
    </div>
  );
}
