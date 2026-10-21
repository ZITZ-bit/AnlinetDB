'use client';
import { useState, useEffect, useRef } from 'react';
import './RegistroCliente.css';
import { api, getErrorMessage, type Caja, type Plan, type Zona } from '../../lib/api';
import { useToast } from '../../components/Toast/use-toast';
import { periodoActual, vencimientoActual } from '../../lib/corte';

function fechaLocal(date: Date): string {
  const anio = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export default function RegistroCliente() {
  const [usuario, setUsuario] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [ipAsignada, setIpAsignada] = useState('');
  const [estado, setEstado] = useState('activo');
  const [zonaId, setZonaId] = useState('');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cajaId, setCajaId] = useState('');
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [planId, setPlanId] = useState('');
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [fechaVencimiento, setFechaVencimiento] = useState(() => fechaLocal(vencimientoActual()));
  const [loading, setLoading] = useState(false);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const { showToast } = useToast();
  const catalogosCargados = useRef(false);

  useEffect(() => {
    if (catalogosCargados.current) return;
    catalogosCargados.current = true;

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

    if (!fechaVencimiento) {
      showToast('Selecciona la fecha de vencimiento', 'error');
      return;
    }

    const plan = planes.find((p) => p.id === parseInt(planId));
    const monto = plan?.precio ?? 0;

    setLoading(true);
    try {
      const cliente = await api.clientes.create({
        usuario: usuario.trim(),
        cedula: cedula.trim() || undefined,
        telefono: telefono.trim() || undefined,
        direccion: direccion.trim(),
        referencia: referencia.trim() || undefined,
        ipAsignada: ipAsignada.trim() || undefined,
        estado,
        zonaId: parseInt(zonaId),
        planId: parseInt(planId),
        cajaId: cajaId ? parseInt(cajaId) : undefined,
      });

      showToast('Cliente registrado exitosamente');

      try {
        await api.cortes.create({
          clienteId: cliente.id,
          monto,
          periodo: periodoActual(new Date(`${fechaVencimiento}T12:00:00`)),
          fechaVencimiento: new Date(`${fechaVencimiento}T12:00:00`).toISOString(),
        });
      } catch {
        showToast('El cliente se registró, pero el corte no', 'error');
      }

      setUsuario('');
      setCedula('');
      setTelefono('');
      setDireccion('');
      setReferencia('');
      setIpAsignada('');
      setEstado('activo');
      setZonaId('');
      setPlanId('');
      setCajaId('');
      setFechaVencimiento(fechaLocal(vencimientoActual()));
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al registrar cliente'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rc-container">
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
                    type="text"
                    required
                    maxLength={100}
                    placeholder=" "
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                  />
                  <span>Usuario</span>
                </label>
              </div>
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

            <div className="rc-input-group">
              <label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder=" "
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                />
                <span>Referencia</span>
              </label>
            </div>

            <div className="rc-input-group">
              <label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder=" "
                  value={ipAsignada}
                  onChange={(e) => setIpAsignada(e.target.value)}
                />
                <span>IP Asignada</span>
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

            <div className="rc-input-group">
              <label>
                <select
                  className={cajaId ? 'rc-select-has-value' : ''}
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
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
                <span>Estado</span>
              </label>
            </div>

            <div className="rc-input-group">
              <label>
                <input
                  type="date"
                  required
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                />
                <span>Fecha de vencimiento</span>
              </label>
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
