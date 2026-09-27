'use client'

import "boxicons/css/boxicons.min.css"
import "@/app/globals.css"

import { TablaMeses, useMesesTabla } from "../hooks/js/tabla"
import { useEffect, useRef, useState, ReactNode, RefObject } from "react"
import { createPortal } from "react-dom"

interface DropdownMenuProps {
  children: ReactNode
  buttonRef: RefObject<HTMLButtonElement | null>
}

function DropdownMenu({ children, buttonRef }: DropdownMenuProps) {

  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 6, left: rect.left })
    }
  }, [buttonRef])

  return createPortal(
    <div className="fixed z-50 w-64 p-4 bg-white border border-[#025F51]/30 shadow-xl" style={{ top: position.top, left: position.left }}>
      {children}
    </div>,
    document.body
  )
}

function Tabla() {
  const { mostrarMenu, toggleMenu, mesesSeleccionados, setMesesSeleccionados, handleCheckboxChange } = useMesesTabla()

  const columnasFijas = ["Nombre", "Apellido", "Cédula", "Zona", "Caja", "Mensualidad"]
  const mesesAMostrar = mesesSeleccionados

  const buttonRef = useRef<HTMLButtonElement | null>(null)

  return (
    <section className="w-full h-full px-6 py-6 bg-white overflow-x-hidden">
      <div className="flex items-start justify-center w-full gap-4">

        <div className="relative flex flex-col items-center mt-1 shrink-0">

          <button ref={buttonRef} onClick={toggleMenu} className="p-3 transition shadow-md rounded-lg bg-[#025F51] hover:bg-[#037968]" title="Filtrar meses">
            <i className={`bx bx-filter-alt text-xl text-gray-200 transition ${mostrarMenu ? "text-[#4cc7b4]" : ""}`}></i>
          </button>

          {mostrarMenu && (
            <DropdownMenu buttonRef={buttonRef}>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Filtrar meses</span>

                <div className="flex gap-1">
                  <button onClick={() => setMesesSeleccionados([...TablaMeses])} className="px-2 py-1 text-xs rounded-lg bg-[#025F51]/10 text-[#025F51] hover:bg-[#025F51]/20">Todos</button>
                  <button onClick={() => setMesesSeleccionados([])} className="px-2 py-1 text-xs text-red-900 rounded-lg bg-red-100 hover:bg-red-200">Ninguno</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-60">

                {TablaMeses.map((mes: string) => (

                  <label key={mes} className="flex items-center p-1 space-x-2 cursor-pointer hover:bg-[#025F51]/10">
                    <input type="checkbox" checked={mesesSeleccionados.includes(mes)} onChange={() => handleCheckboxChange(mes)} className="text-[#025F51] focus:ring-[#025F51]" />
                    <span className="text-sm text-gray-700">{mes}</span>
                  </label>

                ))}

              </div>

            </DropdownMenu>
          )}

        </div>

        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="min-w-full border border-white/50 shadow-md">

            <thead className="bg-[#025F51] text-gray-100 border-b border-white">

              <tr>
                {columnasFijas.map((col) => (
                  <th key={col} className="px-6 py-4 text-sm font-semibold tracking-wider text-center uppercase border-r border-white/60 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                {mesesAMostrar.map((mes) => (
                  <th key={mes} className="px-6 py-4 text-sm font-semibold tracking-wider text-center uppercase border-r border-white/60 whitespace-nowrap">
                    {mes}
                  </th>
                ))}
              </tr>
              
            </thead>

          </table>
        </div>

      </div>
    </section>
  )
}

export default Tabla
