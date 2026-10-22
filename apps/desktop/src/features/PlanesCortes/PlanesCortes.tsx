'use client';
import { useState } from 'react';
import '../../styles/form-kit.css';
import { api, getErrorMessage } from '../../lib/api';
import { useToast } from '../../components/toast/use-toast';

export default function PlanesCortes() {
  const [nombre, setNombre] = useState('');
  const [velocidad, setVelocidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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
    <div className="form-kit">
      <div className="form-kit__card">
        <h1>Planes y Cortes</h1>
        <p className="form-kit__subtitle">
          Configuración de planes de fibra óptica y valores de corte
        </p>

        <form className="form-kit__grid form-kit__grid--single" onSubmit={handleSubmit}>
          <div className="form-kit__column form-kit__column--narrow">
            <div className="form-kit__field">
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

            <div className="form-kit__row form-kit__row--tight form-kit__row--stack">
              <div className="form-kit__field">
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

              <div className="form-kit__field">
                <label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required placeholder=" "
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
                <span>Precio de Corte</span>
                </label>
              </div>
            </div>

            <div className="form-kit__field">
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

          <div className="form-kit__actions">
            <button type="submit" className="form-kit__button" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}