'use client';
import { useState } from 'react';
import './PlanesMensualidades.css';
import { api, getErrorMessage } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';

export default function PlanesMensualidades() {
  const [nombre, setNombre] = useState('');
  const [velocidad, setVelocidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const precioNum = parseFloat(precio);

    if (Number.isNaN(precioNum) || precioNum < 0) {
      showToast('El precio del plan no es válido', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.planes.create({
        nombre: nombre.trim(),
        velocidad: velocidad.trim() || undefined,
        precio: precioNum,
        descripcion: descripcion.trim() || undefined,
      });
      showToast('Plan guardado exitosamente');
      setNombre('');
      setVelocidad('');
      setPrecio('');
      setDescripcion('');
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al guardar plan'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-container">
      <ToastComponent />
      <div className="pm-card">
        <h1>Planes y Mensualidades</h1>
        <p className="pm-subtitle">
          Configuración de planes de fibra óptica y valores de mensualidad
        </p>

        <form className="pm-form-grid" onSubmit={handleSubmit}>
          <div className="pm-left-column">
            <div className="pm-input-group">
              <label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder=" "
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <span>Nombre del Plan</span>
              </label>
            </div>

            <div className="pm-row">
              <div className="pm-input-group">
                <label>
                  <input
                    type="text"
                    required placeholder=" "
                    value={velocidad}
                    onChange={(e) => setVelocidad(e.target.value)}
                  />
                  <span>Velocidad (Mbps)</span>
                </label>
              </div>

              <div className="pm-input-group">
                <label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required placeholder=" "
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
                <span>Precio Mensual</span>
                </label>
              </div>
            </div>

            <div className="pm-input-group">
              <label>
                <input
                  type="text"
                  placeholder=" "
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
                <span>Descripción del Plan</span>
              </label>
            </div>
          </div>

          <div className="pm-full-width">
            <button type="submit" className="pm-btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}