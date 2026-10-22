"use client";

import "boxicons/css/boxicons.min.css";
import "@/app/globals.css";

import { useState } from "react";

import { TablaMeses, useMesesTabla } from "../lib/tabla/meses";
import { todosLosValores } from "../lib/tabla/etiquetas";
import { useTablaDatos } from "../lib/tabla/useTablaDatos";

import type { Cliente } from "../lib/api";

import { ClienteModal } from "./tabla/ClienteModal";
import { EstadoCorteCell } from "./tabla/EstadoCorteCell";
import { FiltroEtiquetas } from "./tabla/FiltroEtiquetas";
import { FiltroMeses } from "./tabla/FiltroMeses";
import { ResumenEtiquetas } from "./tabla/ResumenEtiquetas";
import "./tabla/tabla.css";

const columnasFijas = ["Cédula", "Usuario", "Zona", "Caja", "Corte"];

function Tabla() {
  const { mesesSeleccionados, setMesesSeleccionados, handleCheckboxChange } = useMesesTabla();
  const {
    clientes,
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
  } = useTablaDatos(mesesSeleccionados);

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarResumenEtiquetas, setMostrarResumenEtiquetas] = useState(false);

  return (
    <section className="dashboard-overview">
      <div className="dashboard-overview-content">
        <div className="dashboard-table-toolbar">
          <FiltroMeses
            mesesSeleccionados={mesesSeleccionados}
            onToggleMes={handleCheckboxChange}
            onTodos={() => setMesesSeleccionados([...TablaMeses])}
            onNinguno={() => setMesesSeleccionados([])}
          />
          <FiltroEtiquetas
            etiquetasSeleccionadas={etiquetasSeleccionadas}
            onToggleEtiqueta={toggleEtiqueta}
            onTodas={() => setEtiquetasSeleccionadas(todosLosValores())}
            onNinguna={() => setEtiquetasSeleccionadas([])}
          />
          <input
            className="dashboard-table-search"
            type="search"
            aria-label="Buscar cliente por usuario o cédula"
            placeholder="Buscar por usuario o cédula..."
            value={busquedaUsuario}
            onChange={(e) => setBusquedaUsuario(e.target.value)}
          />
          <input
            className="dashboard-table-search"
            type="search"
            aria-label="Buscar cliente por zona o caja"
            placeholder="Buscar por zona o caja..."
            value={busquedaZonaCaja}
            onChange={(e) => setBusquedaZonaCaja(e.target.value)}
          />
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">

            <thead>

              <tr>
                {columnasFijas.map((col) => (
                  <th key={col}>
                    {col}
                  </th>
                ))}
                {mesesSeleccionados.map((mes) => (
                  <th key={mes}>
                    {mes}
                  </th>
                ))}
              </tr>

            </thead>

            <tbody>
              {clientesFiltrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.cedula || '-'}</td>
                  <td className="dashboard-client-name-cell">
                    <div className="dashboard-client-name-content">
                      <span>{c.usuario}</span>
                      <button
                        type="button"
                        className="dashboard-client-details"
                        aria-label={`Ver detalles de ${c.usuario}`}
                        title="Ver detalles del usuario"
                        onClick={() => setClienteSeleccionado(c)}
                      >
                        <i className="bx bx-show" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                  <td>{c.zona?.nombre || '-'}</td>
                  <td>{c.caja?.codigoCaja || '-'}</td>
                  <td>{fechaCorteCliente(c)}</td>
                  {mesesSeleccionados.map((mes) => {
                    const numeroMes = TablaMeses.indexOf(mes) + 1;
                    const corte = corteDelMes(c.id, numeroMes);

                    return (
                      <td key={mes} className="dashboard-month-td">
                        <EstadoCorteCell
                          cliente={c}
                          mes={numeroMes}
                          corte={corte}
                          onSave={guardarCorte}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={columnasFijas.length + mesesSeleccionados.length}
                    className="dashboard-table-empty"
                  >
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {clienteSeleccionado && (
          <ClienteModal
            cliente={clienteSeleccionado}
            onClose={() => setClienteSeleccionado(null)}
            onSave={(actualizado) => {
              actualizarCliente(actualizado);
              setClienteSeleccionado(null);
            }}
            onDelete={(id) => {
              eliminarCliente(id);
              setClienteSeleccionado(null);
            }}
          />
        )}

        <ResumenEtiquetas
          resumen={resumenEtiquetas}
          etiquetasActivas={etiquetasActivas}
          totalClientes={clientes.length}
          abierto={mostrarResumenEtiquetas}
          onToggle={() => setMostrarResumenEtiquetas((abierto) => !abierto)}
          onClose={() => setMostrarResumenEtiquetas(false)}
        />

      </div>
    </section>
  );
}

export default Tabla;
