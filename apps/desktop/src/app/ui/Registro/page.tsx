'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import "../../../styles/registro.css";
import "../../../styles/auth.css";

export default function Registro() {
  const router = useRouter();
  const { register, loading, error, clear } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    password: '',
    confirm: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clear();
    setFormError(null);
    if (form.password !== form.confirm) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }
      try {
        await register({
          nombre: form.nombre,
          apellido: form.apellido,
          usuario: form.usuario,
          password: form.password,
        });
        sessionStorage.setItem('anlinet:registration-success', 'true');
        router.replace('/');
      } catch {
      // error ya está seteado en el hook
    }
  };

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <main className="auth-container">
      <form className="auth-card auth-card--wide" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">Registro de usuario</p>

        {(error || formError) && (
          <p className="auth-notice auth-notice--error" role="alert">
            {error || formError}
          </p>
        )}
        <div className="registro-row">
          <div className="registro-input">
            <input
              type="text"
              id="nombre"
              required
              value={form.nombre}
              onChange={change}
            />
            <label htmlFor="nombre">
              <span>Nombre</span>
            </label>
          </div>

          <div className="registro-input">
            <input
              type="text"
              id="apellido"
              required
              value={form.apellido}
              onChange={change}
            />
            <label htmlFor="apellido">
              <span>Apellido</span>
            </label>
          </div>
        </div>

        <div className="registro-row">
          <div className="registro-input">
            <input
              type="text"
              id="usuario"
              required
              value={form.usuario}
              onChange={change}
            />
            <label htmlFor="usuario">
              <span>Usuario</span>
            </label>
          </div>

          <div className="registro-input">
            <input
              type="password"
              id="password"
              required
              value={form.password}
              onChange={change}
            />
            <label htmlFor="password">
              <span>Contraseña</span>
            </label>
          </div>
        </div>

        <div className="registro-input">
          <input
            type="password"
            id="confirm"
            required
            value={form.confirm}
            onChange={change}
          />
          <label htmlFor="confirm">
            <span>Confirmar contraseña</span>
          </label>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>

          <p className="auth-redirect">
            ¿Ya tienes cuenta? <Link href="/">Inicia sesión</Link>
          </p>

        <span className="auth-footer">© 2026 Anlinet</span>
      </form>
    </main>
  );
}
