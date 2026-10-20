'use client';
import { useState } from 'react';
import './RegistrarZona.css';
import { api, getErrorMessage } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';

export default function RegistrarZona() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombreLimpio = nombre.trim();
    const descripcionLimpia = descripcion.trim();

    if (!nombreLimpio) {
      showToast('El nombre de la zona es obligatorio', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.zonas.create({
        nombre: nombreLimpio,
        descripcion: descripcionLimpia || undefined,
      });
      showToast('Zona registrada exitosamente');
      setNombre('');
      setDescripcion('');
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al registrar zona'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rz-container">
      <ToastComponent />
      <div className="rz-card">
        <h1>Registrar Zona</h1>
        <p className="rz-subtitle">
          Agregar nuevas zonas para la cobertura de fibra óptica
        </p>

        <form className="rz-form-grid" onSubmit={handleSubmit}>
          <div className="rz-left-column">
            <div className="rz-input-group">
              <label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder=" "
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <span>Nombre de la Zona</span>
              </label>
            </div>

            <div className="rz-input-group">
              <label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder=" "
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
                <span>Descripción</span>
              </label>
            </div>
          </div>

          <div className="rz-full-width">
            <button type="submit" className="rz-btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Zona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
