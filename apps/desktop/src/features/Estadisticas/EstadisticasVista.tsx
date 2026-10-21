'use client';

import './Estadisticas.css';

export interface TotalesEstadisticas {
  clientes: number;
  cajas: number;
  zonas: number;
  cortes: number;
}

interface EstadisticasVistaProps {
  totales: TotalesEstadisticas;
  cargando: boolean;
}

const metricas: { key: keyof TotalesEstadisticas; label: string; icon: string }[] = [
  { key: 'clientes', label: 'Clientes registrados', icon: 'bx-user' },
  { key: 'cajas', label: 'Cajas registradas', icon: 'bx-cabinet' },
  { key: 'zonas', label: 'Zonas registradas', icon: 'bx-map' },
  { key: 'cortes', label: 'Cortes registrados', icon: 'bx-receipt' },
];

export default function EstadisticasVista({ totales, cargando }: EstadisticasVistaProps) {
  return (
    <section className="estadisticas-view">
      <header className="estadisticas-heading">
        <span className="estadisticas-kicker">ANLINET / RESUMEN</span>
        <h1>Estadísticas</h1>
        <p>Una vista general de la operación y sus registros.</p>
      </header>
      <div className="estadisticas-grid">
        {metricas.map((metrica, index) => (
          <article className="estadisticas-metric" key={metrica.key} style={{ animationDelay: `${index * 55}ms` }}>
            <div className="estadisticas-metric-topline">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <i className={`bx ${metrica.icon}`} aria-hidden="true" />
            </div>
            <strong>{cargando ? '—' : totales[metrica.key].toLocaleString('es')}</strong>
            <p>{metrica.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}