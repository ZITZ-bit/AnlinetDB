'use client';
import { useState, useEffect } from 'react';
import '../../styles/form-kit.css';
import { api, getErrorMessage, type Zona } from '../../lib/api';
import { useToast } from '../../components/toast/use-toast';

export default function CrearCajas() {
  const [codigoCaja, setCodigoCaja] = useState('');
  const [direccion, setDireccion] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [tipo, setTipo] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [puertosLibres, setPuertosLibres] = useState('');
  const [estado, setEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    api.zonas.getAll().then(setZonas).catch(() => setZonas([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!zonaId) {
      showToast('Selecciona la zona de la caja', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.cajas.create({
        codigoCaja: codigoCaja.trim(),
        direccion: direccion.trim() || undefined,
        zonaId: parseInt(zonaId),
        tipo: tipo || undefined,
        capacidad: capacidad ? parseInt(capacidad) : undefined,
        puertosLibres: puertosLibres ? parseInt(puertosLibres) : undefined,
        estado: estado || undefined,
        observaciones: observaciones.trim() || undefined,
      });
      showToast('Caja registrada exitosamente');
      setCodigoCaja('');
      setDireccion('');
      setZonaId('');
      setTipo('');
      setCapacidad('');
      setPuertosLibres('');
      setEstado('');
      setObservaciones('');
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al registrar caja'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-kit">
      <div className="form-kit__card form-kit__card--wide">
        <h1>Registrar Caja</h1>
        <p className="form-kit__subtitle">
          Ingresa los datos de la caja de distribución
        </p>

        <form className="form-kit__grid" onSubmit={handleSubmit}>
          <div className="form-kit__column">
            <div className="form-kit__field">
              <label>
                <input
                  type="text"
                  required
                  placeholder=" "
                  value={codigoCaja}
                  onChange={(e) => setCodigoCaja(e.target.value)}
                />
                <span>ID de Caja</span>
              </label>
            </div>

            <div className="form-kit__field">
              <label>
                <input
                  type="text"
                  placeholder=" "
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
                <span>Dirección</span>
              </label>
            </div>

            <div className="form-kit__row">
              <div className="form-kit__field">
                <label>
                  <select required value={zonaId} onChange={(e) => setZonaId(e.target.value)}>
                    <option value="" disabled hidden></option>
                    {zonas.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nombre}
                      </option>
                    ))}
                  </select>
                  <span>Zona</span>
                </label>
              </div>

              <div className="form-kit__field">
                <label>
                  <select required value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    <option value="" disabled hidden></option>
                    <option value="distribucion">Distribución</option>
                    <option value="empalme">Empalme</option>
                    <option value="terminal">Terminal</option>
                    <option value="hermetica">Hermética</option>
                  </select>
                  <span>Tipo</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-kit__column">
            <div className="form-kit__row">
              <div className="form-kit__field">
                <label>
                  <select required value={capacidad} onChange={(e) => setCapacidad(e.target.value)}>
                    <option value="" disabled hidden></option>
                    <option value="8">8 Puertos</option>
                    <option value="16">16 Puertos</option>
                    <option value="24">24 Puertos</option>
                    <option value="32">32 Puertos</option>
                    <option value="48">48 Puertos</option>
                    <option value="64">64 Puertos</option>
                    <option value="128">128 Puertos</option>
                  </select>
                  <span>Capacidad</span>
                </label>
              </div>

              <div className="form-kit__field">
                <label>
                  <input
                    type="number"
                    required
                    placeholder=" "
                    min="0"
                    value={puertosLibres}
                    onChange={(e) => setPuertosLibres(e.target.value)}
                  />
                  <span>Puertos Libres</span>
                </label>
              </div>
            </div>

            <div className="form-kit__field">
              <label>
                <select required value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="" disabled hidden></option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo / Dada de Baja</option>
                  <option value="mantenimiento">En mantenimiento</option>
                  <option value="averiada">Averiada</option>
                </select>
                <span>Estado</span>
              </label>
            </div>

            <div className="form-kit__field">
              <label>
                <input
                  type="text"
                  placeholder=" "
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
                <span>Observaciones (opcional)</span>
              </label>
            </div>
          </div>

          <div className="form-kit__actions">
            <button type="submit" className="form-kit__button" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}