import { useCallback, useState } from "react";

export interface AuthCredentials {
  usuario: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  nombre: string;
  apellido: string;
}

const USERS_KEY = "anlinet:users";
const SESSION_KEY = "anlinet:session";

function readUsers(): Record<string, RegisterData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, RegisterData>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = () => setError(null);

  const login = useCallback(async (usuario: string, password: string) => {
    setLoading(true);
    try {
      const users = readUsers();
      const user = users[usuario];

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!user || user.password !== password) {
        throw new Error("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ usuario }));
      }
      return { usuario: user.usuario, nombre: user.nombre, apellido: user.apellido };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      const users = readUsers();

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (users[data.usuario]) {
        throw new Error("El nombre de usuario ya está en uso.");
      }

      users[data.usuario] = data;
      writeUsers(users);

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ usuario: data.usuario }));
      }
      return data;
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
