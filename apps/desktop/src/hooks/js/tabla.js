import { useState } from "react"

export const TablaMeses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function useMesesTabla() {
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [mesesSeleccionados, setMesesSeleccionados] = useState([...TablaMeses])

  const toggleMenu = () => setMostrarMenu(!mostrarMenu)
  const closeMenu = () => setMostrarMenu(false)

  const handleCheckboxChange = (mes) => {
    setMesesSeleccionados(prev =>
      prev.includes(mes)
        ? prev.filter(m => m !== mes)
        : [...prev, mes]
    )
  }

  return {
    mostrarMenu,
    toggleMenu,
    closeMenu,
    mesesSeleccionados,
    setMesesSeleccionados,
    handleCheckboxChange
  }
}
