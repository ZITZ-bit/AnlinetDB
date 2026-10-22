"use client";

import { useRef, useState } from "react";

import { DropdownMenu } from "./DropdownMenu";
import { etiquetasEstado } from "../../lib/tabla/etiquetas";
import "./tabla.css";

interface FiltroEtiquetasProps {
  etiquetasSeleccionadas: string[];
  onToggleEtiqueta: (value: string) => void;
  onTodas: () => void;
  onNinguna: () => void;
}

export function FiltroEtiquetas({ etiquetasSeleccionadas, onToggleEtiqueta, onTodas, onNinguna }: FiltroEtiquetasProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenuAbierto((abierto) => !abierto)}
        className="dashboard-filter-button"
        title="Filtrar etiquetas"
        aria-label="Filtrar por etiquetas"
        aria-expanded={menuAbierto}
      >
        <i className="bx bx-purchase-tag" />
      </button>

      {menuAbierto && (
        <DropdownMenu buttonRef={buttonRef} onClose={() => setMenuAbierto(false)}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filtrar etiquetas</span>
            <div className="flex gap-1">
              <button type="button" onClick={onTodas} className="dashboard-filter-all px-2 py-1 text-xs">Todas</button>
              <button type="button" onClick={onNinguna} className="dashboard-filter-none px-2 py-1 text-xs">Ninguno</button>
            </div>
          </div>
          <div className="grid gap-1">
            {etiquetasEstado.map((etiqueta) => (
              <label key={etiqueta.value} className="dashboard-tag-filter-option">
                <input
                  type="checkbox"
                  checked={etiquetasSeleccionadas.includes(etiqueta.value)}
                  onChange={() => onToggleEtiqueta(etiqueta.value)}
                />
                <i className="bx bx-purchase-tag dashboard-state-icon" data-state={etiqueta.value} aria-hidden="true" />
                <span>{etiqueta.label}</span>
              </label>
            ))}
          </div>
        </DropdownMenu>
      )}
    </div>
  );
}
