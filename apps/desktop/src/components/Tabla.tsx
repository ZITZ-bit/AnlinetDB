'use client'

import "boxicons/css/boxicons.min.css"
import "@/app/globals.css"

import { TablaMeses, useMesesTabla } from "../hooks/js/tabla"
import { useEffect, useMemo, useRef, useState, ReactNode, RefObject } from "react"
import { createPortal } from "react-dom"
import { mesDePeriodo } from "../lib/mensualidad"
import { api, getErrorMessage, type Cliente, type Mensualidad } from '../lib/api'
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

interface EstadoMensualidadCellProps {
  cliente: Cliente
  mes: number
  mensualidad?: Mensualidad
  onSave: (mensualidad: Mensualidad) => void
}

function EstadoMensualidadCell({ cliente, mes, mensualidad, onSave }: EstadoMensualidadCellProps) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const estado = mensualidad?.estado || "pendiente"
  const etiqueta = etiquetasEstado.find((item) => item.value === estado)

  const guardarEstado = async (estadoSeleccionado: string) => {
    if (guardando) return
    setGuardando(true)

    try {
      const fecha = new Date()
      const anio = fecha.getFullYear()
      const periodo = `${anio}-${String(mes).padStart(2, "0")}`
      const vencimiento = new Date(anio, mes, 0)
      const mensualidadGuardada = mensualidad
        ? await api.mensualidades.update(mensualidad.id, { estado: estadoSeleccionado })
        : await api.mensualidades.create({
            clienteId: cliente.id,
            monto: cliente.plan?.precio ?? 0,
            periodo,
            fechaVencimiento: vencimiento.toISOString(),
            estado: estadoSeleccionado,
          })

      onSave(mensualidadGuardada)
      setMenuAbierto(false)
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo actualizar la etiqueta"), "error")
    } finally {
      setGuardando(false)
    }
  }

  const quitarEtiqueta = async () => {
    if (!mensualidad) {
      setMenuAbierto(false)
      return
    }

    if (guardando) return
    setGuardando(true)

    try {
      const mensualidadActualizada = await api.mensualidades.update(mensualidad.id, { estado: "pendiente" })
      onSave(mensualidadActualizada)
      setMenuAbierto(false)
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo quitar la etiqueta"), "error")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="dashboard-month-cell">
      {mensualidad && estado !== "pendiente" ? (
        <span className="dashboard-box-status" data-state={estado}>
          {etiqueta?.label ?? estado}
        </span>
      ) : !mensualidad ? (
        <span className="dashboard-month-empty">-</span>
      ) : null}
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
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState(etiquetasEstado.map(({ value }) => value))
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mensualidades, setMensualidades] = useState<Mensualidad[]>([])

  const guardarMensualidad = (actualizada: Mensualidad) => {
    setMensualidades((actuales) => [
      ...actuales.filter((mensualidad) => mensualidad.id !== actualizada.id),
      actualizada,
    ])
  }

  useEffect(() => {
    api.clientes.getAll().then(setClientes).catch(() => setClientes([]))
    api.mensualidades.getAll().then(setMensualidades).catch(() => setMensualidades([]))
  }, [])

  const mensualidadesPorCliente = useMemo(() => {
    const mapa = new Map<number, Mensualidad[]>()

    for (const mensualidad of mensualidades) {
      const lista = mapa.get(mensualidad.clienteId) ?? []
      lista.push(mensualidad)
      mapa.set(mensualidad.clienteId, lista)
    }

    for (const lista of mapa.values()) {
      lista.sort((a, b) => String(b.periodo).localeCompare(String(a.periodo)))
    }

    return mapa
  }, [mensualidades])

  const columnasFijas = ["Nombre", "Apellido", "Cédula", "Zona", "Caja", "Mensualidad"]
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

  const mensualidadDelMes = (clienteId: number, mes: number) =>
    (mensualidadesPorCliente.get(clienteId) ?? []).find(
      (mensualidad) => mesDePeriodo(mensualidad.periodo) === mes,
    )

  const montoMensual = (cliente: Cliente) => {
    const lista = mensualidadesPorCliente.get(cliente.id) ?? []
    if (lista.length > 0) return lista[0].monto
    if (cliente.plan?.precio != null) return cliente.plan.precio
    return "-"
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    if (etiquetasSeleccionadas.length === etiquetasEstado.length) return true
    return mesesAMostrar.some((mes) => {
      const mensualidad = mensualidadDelMes(cliente.id, TablaMeses.indexOf(mes) + 1)
      if (!mensualidad) return false
      const estado = mensualidad.estado === "pendiente" ? "pendiente_manual" : mensualidad.estado
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
            aria-label="Buscar cliente por nombre o apellido"
            placeholder="Buscar por nombre o apellido..."
          />
          <input
            className="dashboard-table-search"
            type="search"
            aria-label="Buscar cliente por zona o caja"
            placeholder="Buscar por zona o caja..."
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
                  <td>{c.nombre}</td>
                  <td>{c.apellido}</td>
                  <td>{c.cedula || '-'}</td>
                  <td>{c.zona?.nombre || '-'}</td>
                  <td>{c.caja?.codigoCaja || '-'}</td>
                  <td>{montoMensual(c)}</td>
                  {mesesAMostrar.map((mes) => {
                    const numeroMes = TablaMeses.indexOf(mes) + 1
                    const mensualidad = mensualidadDelMes(c.id, numeroMes)

                    return (
                      <td key={mes}>
                        <EstadoMensualidadCell
                          cliente={c}
                          mes={numeroMes}
                          mensualidad={mensualidad}
                          onSave={guardarMensualidad}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </section>
  )
}

export default Tabla
