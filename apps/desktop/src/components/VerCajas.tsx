'use client';
import { useState, useEffect } from 'react';
import { api, type Caja } from '../lib/api';

export default function VerCajas() {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cajas.getAll().then(setCajas).catch(() => setCajas([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="dashboard-empty-state">Cargando cajas...</p>;

  if (cajas.length === 0) return <p className="dashboard-empty-state">No hay cajas registradas</p>;

  return (
    <div className="dashboard-cards">
        {cajas.map((c) => (
          <div
            key={c.id}
            className="dashboard-box-card"
          >
            <div className="flex items-center justify-between mb-3">
              <h3>{c.codigoCaja}</h3>
              <span className="dashboard-box-status" data-state={c.estado || 'disponible'}>
                {c.estado || 'disponible'}
              </span>
            </div>

            <div className="dashboard-box-details">
              <p><strong>Zona:</strong> {c.zona?.nombre || '-'}</p>
              <p><strong>Tipo:</strong> {c.tipo || '-'}</p>
              <p><strong>Capacidad:</strong> {c.capacidad || 0} puertos</p>
              <p><strong>Puertos libres:</strong> {c.puertosLibres || 0}</p>
              {c.direccion && <p><strong>Dirección:</strong> {c.direccion}</p>}
              {c.observaciones && <p><strong>Obs:</strong> {c.observaciones}</p>}
            </div>
          </div>
        ))}
    </div>
  );
}