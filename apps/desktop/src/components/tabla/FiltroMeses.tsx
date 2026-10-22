"use client";

import { useRef, useState } from "react";

import { TablaMeses } from "../../lib/tabla/meses";
import { DropdownMenu } from "./DropdownMenu";
import "./tabla.css";

interface FiltroMesesProps {
  mesesSeleccionados: string[];
  onToggleMes: (mes: string) => void;
  onTodos: () => void;
  onNinguno: () => void;
}

export function FiltroMeses({ mesesSeleccionados, onToggleMes, onTodos, onNinguno }: FiltroMesesProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenuAbierto((abierto) => !abierto)}
        className="dashboard-filter-button"
        title="Filtrar meses"
        aria-label="Filtrar meses"
        aria-expanded={menuAbierto}
      >
        <i className="bx bx-filter-alt" />
      </button>

      {menuAbierto && (
        <DropdownMenu buttonRef={buttonRef} onClose={() => setMenuAbierto(false)}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filtrar meses</span>

            <div className="flex gap-1">
              <button type="button" onClick={onTodos} className="dashboard-filter-all px-2 py-1 text-xs">Todos</button>
              <button type="button" onClick={onNinguno} className="dashboard-filter-none px-2 py-1 text-xs">Ninguno</button>
            </div>
          </div>

          <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto">
            {TablaMeses.map((mes: string) => (
              <label key={mes} className="flex items-center space-x-2 p-1 text-sm text-gray-700 hover:bg-[#e8f4f0]">
                <input type="checkbox" checked={mesesSeleccionados.includes(mes)} onChange={() => onToggleMes(mes)} />
                <span>{mes}</span>
              </label>
            ))}
          </div>
        </DropdownMenu>
      )}
    </div>
  );
}
