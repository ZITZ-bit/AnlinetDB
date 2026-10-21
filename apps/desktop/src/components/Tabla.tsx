'use client'

import "boxicons/css/boxicons.min.css"
import "@/app/globals.css"

import { TablaMeses, useMesesTabla } from "../hooks/js/tabla"
import { useEffect, useMemo, useRef, useState, ReactNode, RefObject } from "react"
import { createPortal } from "react-dom"
import { mesDePeriodo } from "../lib/corte"
import { api, getErrorMessage, type Cliente, type Corte } from '../lib/api'
import { coincideUsuarioOCedula, coincideZonaOCaja, normalizar } from '../lib/busqueda'
import { addToast } from "./Toast/use-toast"

const etiquetasEstado = [
  { value: "pendiente_manual", label: "Pendiente" },
  { value: "transferencia", label: "Transferencia" },
  { value: "divisa", label: "Divisa" },
  { value: "no_pago", label: "No pago" },
  { value: "nuevo_ingreso", label: "Nuevo ingreso" },
  { value: "dsn", label: "DSN" },
]

interface DropdownMenuProps {
  children: ReactNode
  buttonRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
}

function DropdownMenu({ children, buttonRef, onClose }: DropdownMenuProps) {

  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const updatePosition = () => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = menuRef.current?.offsetWidth || 272
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - menuWidth - 12))
      setPosition({ top: rect.bottom + 6, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) onClose()
    }
    document.addEventListener('click', closeOnOutsideClick)
    return () => {
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('click', closeOnOutsideClick)
    }
  }, [buttonRef, onClose])

  return createPortal(
    <div ref={menuRef} className="dashboard-month-menu fixed z-50" style={{ top: position.top, left: position.left }}>
      {children}
    </div>,
    document.body
  )
}

interface EstadoCorteCellProps {
  cliente: Cliente
  mes: number
  corte?: Corte
  onSave: (corte: Corte) => void
}

function EstadoCorteCell({ cliente, mes, corte, onSave }: EstadoCorteCellProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const estado = corte?.estado || "pendiente"
  const etiqueta = etiquetasEstado.find((item) => item.value === estado)
  const fechaVencimiento = corte?.fechaVencimiento
    ? new Date(`${corte.fechaVencimiento.slice(0, 10)}T00:00:00`).toLocaleDateString("es-ES")
    : null

  const guardarEstado = async (estadoSeleccionado: string) => {
    if (guardando) return
    setGuardando(true)

    try {
      const fecha = new Date()
      const anio = fecha.getFullYear()
      const periodo = `${anio}-${String(mes).padStart(2, "0")}`
      const corteGuardado = corte
        ? await api.cortes.update(corte.id, { estado: estadoSeleccionado })
        : await api.cortes.create({
            clienteId: cliente.id,
            monto: cliente.plan?.precio ?? 0,
            periodo,
            fechaVencimiento: null,
            estado: estadoSeleccionado,
          })

      onSave(corteGuardado)
      setMenuAbierto(false)
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo actualizar la etiqueta"), "error")
    } finally {
      setGuardando(false)
    }
  }

  const quitarEtiqueta = async () => {
    if (!corte) {
      setMenuAbierto(false)
      return
    }

    if (guardando) return
    setGuardando(true)

    try {
      const corteActualizado = await api.cortes.update(corte.id, { estado: "pendiente" })
      onSave(corteActualizado)
      setMenuAbierto(false)
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo quitar la etiqueta"), "error")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="dashboard-month-cell">
      <div className="dashboard-month-content">
        {corte && estado !== "pendiente" ? (
          <span className="dashboard-box-status" data-state={estado}>
            {etiqueta?.label ?? estado}
          </span>
        ) : corte && fechaVencimiento ? (
          <time className="dashboard-month-date" dateTime={corte.fechaVencimiento ?? undefined}>
            {fechaVencimiento}
          </time>
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
  )
}

function Tabla() {
  const { mostrarMenu, toggleMenu, closeMenu, mesesSeleccionados, setMesesSeleccionados, handleCheckboxChange } = useMesesTabla()
  const [mostrarFiltroEtiquetas, setMostrarFiltroEtiquetas] = useState(false)
  const [mostrarResumenEtiquetas, setMostrarResumenEtiquetas] = useState(false)
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState(etiquetasEstado.map(({ value }) => value))
  const [busquedaUsuario, setBusquedaUsuario] = useState("")
  const [busquedaZonaCaja, setBusquedaZonaCaja] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cortes, setCortes] = useState<Corte[]>([])

  const guardarCorte = (actualizado: Corte) => {
    setCortes((actuales) => [
      ...actuales.filter((corte) => corte.id !== actualizado.id),
      actualizado,
    ])
  }

  useEffect(() => {
    api.clientes.getAll().then(setClientes).catch(() => setClientes([]))
    api.cortes.getAll().then(setCortes).catch(() => setCortes([]))
  }, [])

  const cortesPorCliente = useMemo(() => {
    const mapa = new Map<number, Corte[]>()

    for (const corte of cortes) {
      const lista = mapa.get(corte.clienteId) ?? []
      lista.push(corte)
      mapa.set(corte.clienteId, lista)
    }

    for (const lista of mapa.values()) {
      lista.sort((a, b) => String(b.periodo).localeCompare(String(a.periodo)))
    }

    return mapa
  }, [cortes])

  const resumenEtiquetas = useMemo(
    () => etiquetasEstado.map((etiqueta) => ({
      ...etiqueta,
      cantidad: new Set(
        cortes
          .filter((corte) => corte.estado === etiqueta.value)
          .map((corte) => corte.clienteId),
      ).size,
    })),
    [cortes],
  )
  const etiquetasActivas = etiquetasSeleccionadas.length === etiquetasEstado.length
    ? []
    : resumenEtiquetas.filter((etiqueta) => etiquetasSeleccionadas.includes(etiqueta.value))

  const columnasFijas = ["Cédula", "Usuario", "Zona", "Caja", "Corte"]
  const mesesAMostrar = mesesSeleccionados

  const monthFilterButtonRef = useRef<HTMLButtonElement | null>(null)
  const tagFilterButtonRef = useRef<HTMLButtonElement | null>(null)

  const toggleEtiqueta = (value: string) => {
    setEtiquetasSeleccionadas((actuales) =>
      actuales.includes(value)
        ? actuales.filter((etiqueta) => etiqueta !== value)
        : [...actuales, value],
    )
  }

  const corteDelMes = (clienteId: number, mes: number) =>
    (cortesPorCliente.get(clienteId) ?? []).find(
      (corte) => mesDePeriodo(corte.periodo) === mes,
    )

  const fechaCorteCliente = (cliente: Cliente) => {
    const lista = cortesPorCliente.get(cliente.id) ?? []
    const corte = lista.find((item) => item.fechaCorte)
    if (!corte?.fechaCorte) return "-"
    return new Date(corte.fechaCorte).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const consultaUsuario = normalizar(busquedaUsuario)
  const consultaZonaCaja = normalizar(busquedaZonaCaja)

  const clientesFiltrados = clientes.filter((cliente) => {
    if (consultaUsuario && !coincideUsuarioOCedula(cliente, consultaUsuario)) return false
    if (consultaZonaCaja && !coincideZonaOCaja(cliente, consultaZonaCaja)) return false
    if (etiquetasSeleccionadas.length === etiquetasEstado.length) return true
    return mesesAMostrar.some((mes) => {
      const corte = corteDelMes(cliente.id, TablaMeses.indexOf(mes) + 1)
      if (!corte) return false
      const estado = corte.estado === "pendiente" ? "pendiente_manual" : corte.estado
      return etiquetasSeleccionadas.includes(estado)
    })
  })

  return (
    <section className="dashboard-overview">
      <div className="dashboard-overview-content">
        <div className="dashboard-table-toolbar">
          <div className="relative">
            <button ref={monthFilterButtonRef} type="button" onClick={toggleMenu} className="dashboard-filter-button" title="Filtrar meses">
              <i className="bx bx-filter-alt"></i>
            </button>

            {mostrarMenu && (
              <DropdownMenu buttonRef={monthFilterButtonRef} onClose={closeMenu}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Filtrar meses</span>

                  <div className="flex gap-1">
                    <button onClick={() => setMesesSeleccionados([...TablaMeses])} className="dashboard-filter-all px-2 py-1 text-xs">Todos</button>
                    <button onClick={() => setMesesSeleccionados([])} className="dashboard-filter-none px-2 py-1 text-xs">Ninguno</button>
                  </div>
                </div>

                <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto">
                  {TablaMeses.map((mes: string) => (
                    <label key={mes} className="flex items-center space-x-2 p-1 text-sm text-gray-700 hover:bg-[#e8f4f0]">
                      <input type="checkbox" checked={mesesSeleccionados.includes(mes)} onChange={() => handleCheckboxChange(mes)} />
                      <span>{mes}</span>
                    </label>
                  ))}
                </div>
              </DropdownMenu>
            )}
          </div>
          <div className="relative">
            <button
              ref={tagFilterButtonRef}
              type="button"
              onClick={() => setMostrarFiltroEtiquetas((abierto) => !abierto)}
              className="dashboard-filter-button"
              title="Filtrar etiquetas"
              aria-label="Filtrar por etiquetas"
              aria-expanded={mostrarFiltroEtiquetas}
            >
              <i className="bx bx-purchase-tag" />
            </button>
            {mostrarFiltroEtiquetas && (
              <DropdownMenu buttonRef={tagFilterButtonRef} onClose={() => setMostrarFiltroEtiquetas(false)}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Filtrar etiquetas</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setEtiquetasSeleccionadas(etiquetasEstado.map(({ value }) => value))} className="dashboard-filter-all px-2 py-1 text-xs">Todas</button>
                    <button type="button" onClick={() => setEtiquetasSeleccionadas([])} className="dashboard-filter-none px-2 py-1 text-xs">Ninguno</button>
                  </div>
                </div>
                <div className="grid gap-1">
                  {etiquetasEstado.map((etiqueta) => (
                    <label key={etiqueta.value} className="dashboard-tag-filter-option">
                      <input
                        type="checkbox"
                        checked={etiquetasSeleccionadas.includes(etiqueta.value)}
                        onChange={() => toggleEtiqueta(etiqueta.value)}
                      />
                      <i className="bx bx-purchase-tag dashboard-state-icon" data-state={etiqueta.value} aria-hidden="true" />
                      <span>{etiqueta.label}</span>
                    </label>
                  ))}
                </div>
              </DropdownMenu>
            )}
          </div>
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
                {mesesAMostrar.map((mes) => (
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
                  <td>{c.usuario}</td>
                  <td>{c.zona?.nombre || '-'}</td>
                  <td>{c.caja?.codigoCaja || '-'}</td>
                  <td>{fechaCorteCliente(c)}</td>
                  {mesesAMostrar.map((mes) => {
                    const numeroMes = TablaMeses.indexOf(mes) + 1
                    const corte = corteDelMes(c.id, numeroMes)

                    return (
                      <td key={mes} className="dashboard-month-td">
                        <EstadoCorteCell
                          cliente={c}
                          mes={numeroMes}
                          corte={corte}
                          onSave={guardarCorte}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={columnasFijas.length + mesesAMostrar.length}
                    className="dashboard-table-empty"
                  >
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        <div className="dashboard-label-summary">
          {mostrarResumenEtiquetas && (
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
                  onClick={() => setMostrarResumenEtiquetas(false)}
                >
                  <i className="bx bx-x" aria-hidden="true" />
                </button>
              </header>
              <ul className="dashboard-label-summary-list">
                {resumenEtiquetas.map((etiqueta) => (
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
                  <strong>{clientes.length}</strong>
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
              aria-label={mostrarResumenEtiquetas ? "Cerrar resumen de etiquetas" : "Ver usuarios por etiqueta"}
              aria-expanded={mostrarResumenEtiquetas}
              aria-controls="dashboard-label-summary-panel"
              onClick={() => setMostrarResumenEtiquetas((abierto) => !abierto)}
            >
              <i className={mostrarResumenEtiquetas ? "bx bx-x" : "bx bx-purchase-tag"} aria-hidden="true" />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Tabla
