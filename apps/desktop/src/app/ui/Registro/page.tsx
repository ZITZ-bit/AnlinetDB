'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import "../../../styles/registro.css";

export default function Registro() {
  const router = useRouter();
  const { register, loading, error, clear } = useAuth();
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
    if (form.password !== form.confirm) {
      return;
    }
      try {
        await register({
          nombre: form.nombre,
          apellido: form.apellido,
          usuario: form.usuario,
          password: form.password,
        });
        router.push('/');
      } catch {
      // error ya está seteado en el hook
    }
  };

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <main className="registro-container">
      <form className="registro-card" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        <p className="subtitle">Registro de usuario</p>

        {error && <p className="error-msg">{error}</p>}

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
          className="registro-btn"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>

          <p className="registro-redirect">
            ¿Ya tienes cuenta? <Link href="/">Inicia sesión</Link>
          </p>

        <span className="registro-footer">© 2026 Anlinet</span>
      </form>
    </main>
  );
}
