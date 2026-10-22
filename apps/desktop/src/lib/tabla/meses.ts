import { useState } from "react"

export const TablaMeses: string[] = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function useMesesTabla() {
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([...TablaMeses])

  const handleCheckboxChange = (mes: string) => {
    setMesesSeleccionados(prev =>
      prev.includes(mes)
        ? prev.filter(m => m !== mes)
        : [...prev, mes]
    )
  }

  return {
    mesesSeleccionados,
    setMesesSeleccionados,
    handleCheckboxChange
  }
}
