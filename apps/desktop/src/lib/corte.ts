export function periodoActual(date: Date = new Date()): string {
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${mes}`;
}

export function vencimientoActual(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function mesDePeriodo(periodo: string): number | null {
  const match = /^(\d{4})-(\d{1,2})$/.exec(periodo ?? '');
  if (!match) return null;

  const mes = Number(match[2]);
  return mes >= 1 && mes <= 12 ? mes : null;
}
