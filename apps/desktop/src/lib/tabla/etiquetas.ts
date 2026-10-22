export interface EtiquetaEstado {
  value: string;
  label: string;
}

export interface ResumenEtiqueta extends EtiquetaEstado {
  cantidad: number;
}

export const etiquetasEstado: EtiquetaEstado[] = [
  { value: "pendiente_manual", label: "Pendiente" },
  { value: "transferencia", label: "Transferencia" },
  { value: "divisa", label: "Divisa" },
  { value: "no_pago", label: "No pago" },
  { value: "nuevo_ingreso", label: "Nuevo ingreso" },
  { value: "dsn", label: "DSN" },
];

export const todosLosValores = () => etiquetasEstado.map(({ value }) => value);
