import { useCallback, useState } from "react";

export interface AuthCredentials {
  usuario: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  nombre: string;
  apellido: string;
}

const SESSION_KEY = "anlinet:session";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = () => setError(null);

  const login = useCallback(async (usuario: string, password: string) => {
    setLoading(true);
    clear();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciales incorrectas. Verifica tu usuario y contraseña.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ usuario: data.user.usuario }));
      }
      return { usuario: data.user.usuario, nombre: data.user.nombre, apellido: data.user.apellido };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    clear();
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al registrar la cuenta.");
      }

      return result.user;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar la cuenta.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  return { login, register, logout, loading, error, clear };
}
