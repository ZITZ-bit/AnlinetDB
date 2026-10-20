'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/ts/use-auth';
import { addToast } from '@/components/Toast/use-toast';
import "../styles/login.css";

export default function Login() {
  const router = useRouter();
  const { login, loading, error, clear } = useAuth();
  const [registrationSuccess] = useState(() => {
    if (typeof window === 'undefined') return false;

    const registrado = sessionStorage.getItem('anlinet:registration-success') === 'true';
    if (registrado) sessionStorage.removeItem('anlinet:registration-success');
    return registrado;
  });

  useEffect(() => {
    const expirada = sessionStorage.getItem('anlinet:session-expired') === 'true';
    if (expirada) {
      sessionStorage.removeItem('anlinet:session-expired');
      addToast('Tu sesión expiró. Vuelve a iniciar sesión.', 'error');
    }
  }, []);
  const [form, setForm] = useState({ usuario: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clear();
    try {
      await login(form.usuario, form.password);
      router.push('/ui/Dashboard');
    } catch {
      // error ya está seteado en el hook
    }
  };

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <main className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>
        <p className="subtitle">Accede a tu cuenta</p>

        {registrationSuccess && (
          <p className="success-msg" role="status">
            Cuenta creada correctamente. Inicia sesión para continuar.
          </p>
        )}
        {error && <p className="error-msg">{error}</p>}

        <div className="input-group">
          <label htmlFor="usuario">
            <input
              type="text"
              id="usuario"
              autoComplete="username"
              required
              value={form.usuario}
              onChange={change}
            />
            <span>Usuario</span>
          </label>
        </div>

        <div className="input-group">
          <label htmlFor="password">
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={change}
            />
            <span>Contraseña</span>
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p className="redirect">
          ¿No tienes cuenta? <a href="/ui/Registro">Crear cuenta</a>
        </p>

        <span className="footer">© 2026 Anlinet</span>
      </form>
    </main>
  );
}
