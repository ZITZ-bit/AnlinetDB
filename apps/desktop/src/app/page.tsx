'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { addToast } from '@/components/toast/use-toast';
import "../styles/login.css";
import "../styles/auth.css";

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
    <main className="auth-container">
      <form className="auth-card auth-card--narrow" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>
        <p className="auth-subtitle">Accede a tu cuenta</p>

        {registrationSuccess && (
          <p className="auth-notice auth-notice--success" role="status">
            Cuenta creada correctamente. Inicia sesión para continuar.
          </p>
        )}
        {error && <p className="auth-notice auth-notice--error">{error}</p>}

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
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p className="auth-redirect">
          ¿No tienes cuenta? <a href="/ui/Registro">Crear cuenta</a>
        </p>

        <span className="auth-footer">© 2026 Anlinet</span>
      </form>
    </main>
  );
}
