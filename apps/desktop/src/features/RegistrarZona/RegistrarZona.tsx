'use client';
import { useState } from 'react';
import '../../styles/form-kit.css';
import { api, getErrorMessage } from '../../lib/api';
import { useToast } from '../../components/toast/use-toast';

export default function RegistrarZona() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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
    <div className="form-kit">
      <div className="form-kit__card">
        <h1>Registrar Zona</h1>
        <p className="form-kit__subtitle">
          Agregar nuevas zonas para la cobertura de fibra óptica
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
                <span>Nombre de la Zona</span>
              </label>
            </div>

            <div className="form-kit__field">
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

          <div className="form-kit__actions">
            <button type="submit" className="form-kit__button" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Zona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
