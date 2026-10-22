'use client';

import { useEffect, useState } from 'react';
import 'boxicons/css/boxicons.min.css';
import './VerCajas.css';
import '../../styles/estado-badge.css';
import { api, type Caja } from '../../lib/api';

const ESTADO_POR_DEFECTO = 'disponible';

function getPorcentajeLibre(caja: Caja): number {
  const capacidad = caja.capacidad ?? 0;
  if (capacidad <= 0) return 0;

  const libres = Math.max(0, Math.min(caja.puertosLibres ?? 0, capacidad));
  return Math.round((libres / capacidad) * 100);
}

export default function VerCajas() {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    api.cajas
      .getAll()
      .then((data) => {
        if (activo) setCajas(data);
      })
      .catch(() => {
        if (activo) setCajas([]);
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="vc-view">
        <div className="vc-inner">
          <div className="vc-state" role="status">
            <span className="vc-spinner" aria-hidden="true" />
            <p>Cargando cajas...</p>
          </div>
        </div>
      </section>
    );
  }

  if (cajas.length === 0) {
    return (
      <section className="vc-view">
        <div className="vc-inner">
          <div className="vc-state">
            <i className="bx bx-cabinet" aria-hidden="true" />
            <p>No hay cajas registradas</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="vc-view">
      <div className="vc-inner">
        <header className="vc-heading">
          <div>
            <span className="vc-kicker">ANLINET / CAJAS</span>
            <h1>Cajas registradas</h1>
            <p>Listado de cajas de distribución y su estado actual.</p>
          </div>
          <span className="vc-total">
            {cajas.length} {cajas.length === 1 ? 'caja' : 'cajas'}
          </span>
        </header>

        <div className="vc-grid">
          {cajas.map((caja, index) => {
            const estado = caja.estado || ESTADO_POR_DEFECTO;
            const porcentajeLibre = getPorcentajeLibre(caja);

            return (
              <article
                className="vc-card"
                key={caja.id}
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              >
                <div className="vc-card-top">
                  <h2 className="vc-card-title">{caja.codigoCaja}</h2>
                  <span className="estado-badge" data-state={estado}>
                    {estado}
                  </span>
                </div>

                <div className="vc-capacity">
                  <div className="vc-capacity-head">
                    <span>Puertos libres</span>
                    <strong>
                      {caja.puertosLibres || 0} / {caja.capacidad || 0}
                    </strong>
                  </div>
                  <div className="vc-capacity-track">
                    <span className="vc-capacity-fill" style={{ width: `${porcentajeLibre}%` }} />
                  </div>
                </div>

                <dl className="vc-details">
                  <div className="vc-detail">
                    <dt>Zona</dt>
                    <dd>{caja.zona?.nombre || '-'}</dd>
                  </div>

                  <div className="vc-detail">
                    <dt>Tipo</dt>
                    <dd>{caja.tipo || '-'}</dd>
                  </div>

                  <div className="vc-detail">
                    <dt>Capacidad</dt>
                    <dd>{caja.capacidad || 0} puertos</dd>
                  </div>

                  {caja.direccion && (
                    <div className="vc-detail vc-detail--stack">
                      <dt>Dirección</dt>
                      <dd>{caja.direccion}</dd>
                    </div>
                  )}

                  {caja.observaciones && (
                    <div className="vc-detail vc-detail--stack">
                      <dt>Obs</dt>
                      <dd>{caja.observaciones}</dd>
                    </div>
                  )}
                </dl>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
