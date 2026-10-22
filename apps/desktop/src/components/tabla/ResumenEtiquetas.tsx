"use client";

import type { ResumenEtiqueta } from "../../lib/tabla/etiquetas";
import "./tabla.css";

interface ResumenEtiquetasProps {
  resumen: ResumenEtiqueta[];
  etiquetasActivas: ResumenEtiqueta[];
  totalClientes: number;
  abierto: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function ResumenEtiquetas({
  resumen,
  etiquetasActivas,
  totalClientes,
  abierto,
  onToggle,
  onClose,
}: ResumenEtiquetasProps) {
  return (
    <div className="dashboard-label-summary">
      {abierto && (
        <section
          id="dashboard-label-summary-panel"
          className="dashboard-label-summary-panel"
          aria-label="Resumen de usuarios por etiqueta"
        >
          <header className="dashboard-label-summary-header">
            <h2>Usuarios por etiqueta</h2>
            <button
              type="button"
              className="dashboard-label-summary-close"
              aria-label="Cerrar resumen de etiquetas"
              onClick={onClose}
            >
              <i className="bx bx-x" aria-hidden="true" />
            </button>
          </header>
          <ul className="dashboard-label-summary-list">
            {resumen.map((etiqueta) => (
              <li key={etiqueta.value}>
                <span className="dashboard-label-summary-name">
                  <span className="dashboard-label-dot" data-state={etiqueta.value} aria-hidden="true" />
                  {etiqueta.label}
                </span>
                <strong>{etiqueta.cantidad}</strong>
              </li>
            ))}
            <li className="dashboard-label-summary-total">
              <span>Total de clientes</span>
              <strong>{totalClientes}</strong>
            </li>
          </ul>
        </section>
      )}

      <div className="dashboard-label-summary-dock">
        {etiquetasActivas.map((etiqueta) => (
          <span key={etiqueta.value} className="dashboard-label-selected-chip">
            <span className="dashboard-label-dot" data-state={etiqueta.value} aria-hidden="true" />
            <span>{etiqueta.label}</span>
            <strong>{etiqueta.cantidad}</strong>
          </span>
        ))}
        <button
          type="button"
          className="dashboard-label-summary-trigger"
          aria-label={abierto ? "Cerrar resumen de etiquetas" : "Ver usuarios por etiqueta"}
          aria-expanded={abierto}
          aria-controls="dashboard-label-summary-panel"
          onClick={onToggle}
        >
          <i className={abierto ? "bx bx-x" : "bx bx-purchase-tag"} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
