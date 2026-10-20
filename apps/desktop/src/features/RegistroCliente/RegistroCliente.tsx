'use client';
import { useState, useEffect } from 'react';
import './RegistroCliente.css';
import { api, getErrorMessage, type Caja, type Plan, type Zona } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { periodoActual, vencimientoActual } from '../../lib/mensualidad';

export default function RegistroCliente() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cajaId, setCajaId] = useState('');
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [planId, setPlanId] = useState('');
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [mensualidad, setMensualidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    Promise.all([
      api.zonas.getAll().catch(() => []),
      api.planes.getAll().catch(() => []),
      api.cajas.getAll().catch(() => []),
    ])
      .then(([zonasData, planesData, cajasData]) => {
        setZonas(zonasData);
        setPlanes(planesData);
        setCajas(cajasData);

        if (!zonasData.length) {
          showToast('Primero registra una zona antes de registrar clientes', 'error');
        }
        if (!planesData.length) {
          showToast('Primero registra un plan antes de registrar clientes', 'error');
        }
      })
      .finally(() => setCargandoCatalogos(false));
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!zonaId || !planId) {
      showToast('Selecciona la zona y el plan del cliente', 'error');
      return;
    }

    const monto = mensualidad ? Number(mensualidad) : 0;

    if (Number.isNaN(monto) || monto < 0) {
      showToast('El monto de la mensualidad no es válido', 'error');
      return;
    }

    setLoading(true);
    try {
      const cliente = await api.clientes.create({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cedula: cedula.trim() || undefined,
        telefono: telefono.trim() || undefined,
        direccion: direccion.trim(),
        zonaId: parseInt(zonaId),
        planId: parseInt(planId),
        cajaId: cajaId ? parseInt(cajaId) : undefined,
      });

      showToast('Cliente registrado exitosamente');

      if (monto > 0) {
        try {
          await api.mensualidades.create({
            clienteId: cliente.id,
            monto,
            periodo: periodoActual(),
            fechaVencimiento: vencimientoActual().toISOString(),
          });
        } catch {
          showToast('El cliente se registró, pero la mensualidad no', 'error');
        }
      }

      setNombre('');
      setApellido('');
      setCedula('');
      setTelefono('');
      setDireccion('');
      setZonaId('');
      setPlanId('');
      setCajaId('');
      setMensualidad('');
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al registrar cliente'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rc-container">
      <ToastComponent />
      <div className="rc-card">
        <h1>Registro de Cliente</h1>
        <p className="rc-subtitle">
          Registro de cliente para servicio de fibra óptica
        </p>

        <form className="rc-form-grid" onSubmit={handleSubmit}>
          <div className="rc-left-column">
            <div className="rc-row">
              <div className="rc-input-group">
                <label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder=" "
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                  <span>Nombre</span>
                </label>
              </div>

              <div className="rc-input-group">
                <label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder=" "
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                  <span>Apellido</span>
                </label>
              </div>
            </div>

            <div className="rc-row">
              <div className="rc-input-group">
                <label>
                  <input
                    type="text"
                    maxLength={20}
                    placeholder=" "
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                  />
                  <span>Cédula</span>
                </label>
              </div>

              <div className="rc-input-group">
                <label>
                  <input
                    type="tel"
                    maxLength={20}
                    placeholder=" "
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                  <span>Teléfono</span>
                </label>
              </div>
            </div>

            <div className="rc-input-group">
              <label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder=" "
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
                <span>Dirección</span>
              </label>
            </div>
          </div>

          <div className="rc-right-column">
            <div className="rc-input-group">
              <label>
                <select
                  required
                  value={zonaId}
                  onChange={(e) => setZonaId(e.target.value)}
                >
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

            <div className="rc-row">
              <div className="rc-input-group">
                <label>
                <select
                  value={cajaId}
                  onChange={(e) => setCajaId(e.target.value)}
                >
                    <option value="" disabled hidden></option>
                    {cajas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigoCaja}
                      </option>
                    ))}
                </select>
                <span>Caja</span>
                </label>
              </div>

              <div className="rc-input-group">
                <label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder=" "
                    value={mensualidad}
                    onChange={(e) => setMensualidad(e.target.value)}
                  />
                  <span>Mensualidad</span>
                </label>
              </div>
            </div>

            <div className="rc-input-group">
              <label>
                <select
                  required
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                >
                  <option value="" disabled hidden></option>
                  {planes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <span>Plan</span>
              </label>
            </div>
          </div>

          <div className="rc-full-width">
            <button
              type="submit"
              className="rc-btn-primary"
              disabled={loading || cargandoCatalogos}
            >
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
