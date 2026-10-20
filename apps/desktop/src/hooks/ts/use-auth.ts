import { useCallback, useState } from 'react';

import { apiFetch, getErrorMessage } from "../../lib/api";
import { addToast } from "../../components/Toast/use-toast";

export interface AuthCredentials {
  usuario: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  nombre: string;
  apellido: string;
}

interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
}

interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

const SESSION_KEY = "anlinet:session";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = () => setError(null);

  const login = useCallback(async (usuario: string, password: string) => {
    setLoading(true);
    clear();
    try {
      const data = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ usuario, password }),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ usuario: data.user.usuario, nombre: data.user.nombre }),
        );
        localStorage.setItem("token", data.access_token);
      }
      addToast(`Bienvenido de nuevo, ${data.user.nombre}.`, 'success');
      return { usuario: data.user.usuario, nombre: data.user.nombre, apellido: data.user.apellido };
    } catch (e) {
      const message = getErrorMessage(e, "Error al iniciar sesión.");
      setError(message);
      addToast(message, 'error');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    clear();
    try {
      const result = await apiFetch<{ user: AuthUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      addToast(`Cuenta creada para ${result.user.nombre} ${result.user.apellido}.`, 'success');
      return result.user;
    } catch (e) {
      const message = getErrorMessage(e, "Error al registrar la cuenta.");
      setError(message);
      addToast(message, 'error');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem("token");
      addToast("Sesión cerrada.", 'info');
    }
  }, []);

  return { login, register, logout, loading, error, clear };
}