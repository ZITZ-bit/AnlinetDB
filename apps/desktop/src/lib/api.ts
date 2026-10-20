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
  nombre: string;
  apellido: string;
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

export interface Mensualidad {
  id: number;
  clienteId: number;
  monto: number;
  periodo: string;
  fechaVencimiento: string;
  fechaPago: string | null;
  estado: string;
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
    create: (data: { nombre: string; descripcion?: string }) =>
      apiFetch<Zona>('/zonas', { method: 'POST', body: JSON.stringify(data) }),
  },
  planes: {
    getAll: () => apiFetch<Plan[]>('/planes'),
    create: (data: {
      nombre: string;
      velocidad?: string;
      precio: number;
      descripcion?: string;
    }) => apiFetch<Plan>('/planes', { method: 'POST', body: JSON.stringify(data) }),
  },
  cajas: {
    getAll: () => apiFetch<Caja[]>('/cajas'),
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
    create: (data: {
      nombre: string;
      apellido: string;
      cedula?: string;
      telefono?: string;
      direccion: string;
      zonaId: number;
      planId: number;
      cajaId?: number;
    }) => apiFetch<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
  },
  mensualidades: {
    getAll: () => apiFetch<Mensualidad[]>('/mensualidades'),
    create: (data: {
      clienteId: number;
      monto: number;
      periodo: string;
      fechaVencimiento: string;
    }) => apiFetch<Mensualidad>('/mensualidades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
};
