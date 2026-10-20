'use client'

import "boxicons/css/boxicons.min.css"
import "@/app/globals.css"

import { TablaMeses, useMesesTabla } from "../hooks/js/tabla"
import { useEffect, useMemo, useRef, useState, ReactNode, RefObject } from "react"
import { createPortal } from "react-dom"
import { mesDePeriodo } from "../lib/mensualidad"
import { api, type Cliente, type Mensualidad } from '../lib/api'

interface DropdownMenuProps {
  children: ReactNode
  buttonRef: RefObject<HTMLButtonElement | null>
}

function DropdownMenu({ children, buttonRef }: DropdownMenuProps) {

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
    return () => window.removeEventListener('resize', updatePosition)
  }, [buttonRef])

  return createPortal(
    <div ref={menuRef} className="dashboard-month-menu fixed z-50" style={{ top: position.top, left: position.left }}>
      {children}
    </div>,
    document.body
  )
}

function Tabla() {
  const { mostrarMenu, toggleMenu, mesesSeleccionados, setMesesSeleccionados, handleCheckboxChange } = useMesesTabla()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mensualidades, setMensualidades] = useState<Mensualidad[]>([])

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

  const buttonRef = useRef<HTMLButtonElement | null>(null)

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

  return (
    <section className="dashboard-overview">
      <div className="dashboard-overview-content">
        <div className="dashboard-table-toolbar">
        <div className="relative">

          <button ref={buttonRef} onClick={toggleMenu} className="dashboard-filter-button" title="Filtrar meses">
            <i className="bx bx-filter-alt"></i>
          </button>

          {mostrarMenu && (
            <DropdownMenu buttonRef={buttonRef}>

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
              {clientes.map((c) => (
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

                    if (!mensualidad) {
                      return <td key={mes}>-</td>
                    }

                    const estado = mensualidad.estado || "pendiente"

                    return (
                      <td key={mes}>
                        <span className="dashboard-box-status" data-state={estado}>
                          {estado}
                        </span>
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
