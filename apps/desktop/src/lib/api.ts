const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Zona {
  id: number;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: number;
  nombre: string;
  velocidad: string | null;
  precio: number;
  descripcion: string | null;
  activo: boolean;
}

export interface Caja {
  id: number;
  codigoCaja: string;
  direccion: string | null;
  zonaId: number | null;
  tipo: string;
  capacidad: number;
  puertosLibres: number;
  estado: string;
  observaciones: string | null;
  zona?: Zona | null;
}

export interface Cliente {
  id: number;
  usuario: string;
  cedula: string | null;
  telefono: string | null;
  direccion: string;
  referencia: string | null;
  zonaId: number;
  cajaId: number | null;
  planId: number;
  estado: string;
  ipAsignada: string | null;
  zona?: Zona | null;
  plan?: Plan | null;
  caja?: Caja | null;
}

export interface Corte {
  id: number;
  clienteId: number;
  monto: number;
  periodo: string;
  fechaVencimiento: string | null;
  fechaCorte: string | null;
  fechaPago: string | null;
  estado: string;
  revisado: boolean;
  observacion: string | null;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function extractMessage(body: unknown, fallback: string): string {
  const raw = (body as { message?: unknown; error?: unknown } | null)?.message ??
    (body as { error?: unknown } | null)?.error;

  if (Array.isArray(raw)) {
    const text = raw.filter((item) => typeof item === 'string').join('. ');
    return text || fallback;
  }

  if (typeof raw === 'string' && raw.trim()) {
    return raw;
  }

  return fallback;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => '');

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };

  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con la API. Verifica que esté corriendo en el puerto 3002.',
      0,
    );
  }

  const body = await parseBody(res);

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('anlinet:session');
        sessionStorage.setItem('anlinet:session-expired', 'true');
        window.dispatchEvent(new CustomEvent('anlinet:session-expired'));
      }
      throw new ApiError('Tu sesión expiró. Vuelve a iniciar sesión.', 401);
    }

    if (res.status === 409) {
      throw new ApiError(extractMessage(body, 'Ya existe un registro con esos datos'), 409);
    }

    if (res.status === 400) {
      throw new ApiError(extractMessage(body, 'Los datos enviados no son válidos'), 400);
    }

    if (res.status >= 500) {
      throw new ApiError(
        extractMessage(body, 'Error interno del servidor. Revisa los logs de la API.'),
        res.status,
      );
    }

    throw new ApiError(extractMessage(body, `Error en la petición (${res.status})`), res.status);
  }

  return body as T;
}

export const api = {
  zonas: {
    getAll: () => apiFetch<Zona[]>('/zonas'),
    remove: (id: number) => apiFetch<void>(`/zonas/${id}`, { method: 'DELETE' }),
    create: (data: { nombre: string; descripcion?: string }) =>
      apiFetch<Zona>('/zonas', { method: 'POST', body: JSON.stringify(data) }),
  },
  planes: {
    getAll: () => apiFetch<Plan[]>('/planes'),
    remove: (id: number) => apiFetch<void>(`/planes/${id}`, { method: 'DELETE' }),
    create: (data: {
      nombre: string;
      velocidad?: string;
      precio: number;
      descripcion?: string;
    }) => apiFetch<Plan>('/planes', { method: 'POST', body: JSON.stringify(data) }),
  },
  cajas: {
    getAll: () => apiFetch<Caja[]>('/cajas'),
    remove: (id: number) => apiFetch<void>(`/cajas/${id}`, { method: 'DELETE' }),
    create: (data: {
      codigoCaja: string;
      direccion?: string;
      zonaId?: number;
      tipo?: string;
      capacidad?: number;
      puertosLibres?: number;
      estado?: string;
      observaciones?: string;
    }) => apiFetch<Caja>('/cajas', { method: 'POST', body: JSON.stringify(data) }),
  },
  clientes: {
    getAll: () => apiFetch<Cliente[]>('/clientes'),
    update: (id: number, data: {
      usuario: string;
      cedula: string | null;
      telefono: string | null;
      direccion: string;
      referencia: string | null;
      zonaId: number;
      cajaId: number | null;
      planId: number;
      estado: string;
      ipAsignada: string | null;
    }) => apiFetch<Cliente>(`/clientes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    remove: (id: number) => apiFetch<void>(`/clientes/${id}`, { method: 'DELETE' }),
    create: (data: {
      usuario: string;
      cedula?: string;
      telefono?: string;
      direccion: string;
      referencia?: string;
      zonaId: number;
      planId: number;
      cajaId?: number;
      estado?: string;
      ipAsignada?: string;
    }) => apiFetch<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
  },
  cortes: {
    getAll: () => apiFetch<Corte[]>('/cortes'),
    remove: (id: number) => apiFetch<void>(`/cortes/${id}`, { method: 'DELETE' }),
    create: (data: {
      clienteId: number;
      monto: number;
      periodo: string;
      fechaVencimiento?: string | null;
      estado?: string;
    }) => apiFetch<Corte>('/cortes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: { estado: string }) => apiFetch<Corte>(`/cortes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },
};
