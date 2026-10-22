import type { Cliente } from '../api';

export function normalizar(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function coincideUsuarioOCedula(cliente: Cliente, consulta: string): boolean {
  const termino = normalizar(consulta);
  if (!termino) return true;

  return (
    normalizar(cliente.usuario).includes(termino) ||
    normalizar(cliente.cedula ?? '').includes(termino)
  );
}

export function coincideZonaOCaja(cliente: Cliente, consulta: string): boolean {
  const termino = normalizar(consulta);
  if (!termino) return true;

  return (
    normalizar(cliente.zona?.nombre ?? '').includes(termino) ||
    normalizar(cliente.caja?.codigoCaja ?? '').includes(termino)
  );
}
