'use client';

import { useMemo, useState } from 'react';
import type { Caja, Cliente, Zona } from '@/lib/api';
import './Estadisticas.css';

export interface TotalesEstadisticas {
  clientes: number;
  cajas: number;
  zonas: number;
  cortes: number;
}

interface EstadisticasVistaProps {
  totales: TotalesEstadisticas;
  registros: { clientes: Cliente[]; cajas: Caja[]; zonas: Zona[] };
  cargando: boolean;
}

type Entidad = 'clientes' | 'zonas' | 'cajas';
type Periodo = 'dia' | 'mes' | 'ano';
type TipoGrafica = 'barras' | 'linea';

interface PuntoGrafica {
  etiqueta: string;
  valor: number;
}

const metricas: { key: keyof TotalesEstadisticas; label: string; icon: string }[] = [
  { key: 'clientes', label: 'Clientes registrados', icon: 'bx-user' },
  { key: 'cajas', label: 'Cajas registradas', icon: 'bx-cabinet' },
  { key: 'zonas', label: 'Zonas registradas', icon: 'bx-map' },
  { key: 'cortes', label: 'Cortes registrados', icon: 'bx-receipt' },
];

const pestanas: { key: Entidad; label: string }[] = [
  { key: 'clientes', label: 'Clientes' },
  { key: 'zonas', label: 'Zonas' },
  { key: 'cajas', label: 'Cajas' },
];

const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fechaLocal(fecha: Date): string {
  const ano = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function EstadisticasVista({ totales, registros, cargando }: EstadisticasVistaProps) {
  const [entidad, setEntidad] = useState<Entidad>('clientes');
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [tipoGrafica, setTipoGrafica] = useState<TipoGrafica>('barras');
  const [fecha, setFecha] = useState(() => fechaLocal(new Date()));
  const [ano, setAno] = useState(() => new Date().getFullYear());

  const datos = registros[entidad];
  const anosDisponibles = useMemo(() => {
    const anos = datos.map(({ createdAt }) => new Date(createdAt).getFullYear()).filter(Number.isFinite);
    return [...new Set([...anos, new Date().getFullYear()])].sort((a, b) => b - a);
  }, [datos]);

  const puntos = useMemo<PuntoGrafica[]>(() => {
    const [anoFecha, mesFecha, diaFecha] = fecha.split('-').map(Number);
    let cantidadPuntos = 12;
    let etiquetaPunto = (indice: number) => meses[indice];
    let coincide: (creado: Date) => boolean = (creado) => creado.getFullYear() === ano;

    if (periodo === 'mes') {
      cantidadPuntos = new Date(anoFecha, mesFecha, 0).getDate();
      etiquetaPunto = (indice) => String(indice + 1);
      coincide = (creado) => creado.getFullYear() === anoFecha && creado.getMonth() === mesFecha - 1;
    } else if (periodo === 'dia') {
      cantidadPuntos = 24;
      etiquetaPunto = (indice) => String(indice).padStart(2, '0');
      coincide = (creado) => fechaLocal(creado) === `${fecha}` && creado.getFullYear() === anoFecha && creado.getMonth() === mesFecha - 1 && creado.getDate() === diaFecha;
    }

    const valores = Array.from({ length: cantidadPuntos }, () => 0);
    datos.forEach(({ createdAt }) => {
      const creado = new Date(createdAt);
      if (!Number.isFinite(creado.getTime()) || !coincide(creado)) return;
      const indice = periodo === 'dia' ? creado.getHours() : periodo === 'mes' ? creado.getDate() - 1 : creado.getMonth();
      valores[indice] += 1;
    });

    return valores.map((valor, indice) => ({ etiqueta: etiquetaPunto(indice), valor }));
  }, [ano, datos, fecha, periodo]);

  const totalPeriodo = puntos.reduce((suma, punto) => suma + punto.valor, 0);
  const maximo = Math.max(1, ...puntos.map((punto) => punto.valor));
  const altoGrafica = 220;
  const anchoGrafica = 900;
  const margenIzquierdo = 36;
  const margenDerecho = 12;
  const margenSuperior = 16;
  const altoUtil = 170;
  const anchoUtil = anchoGrafica - margenIzquierdo - margenDerecho;
  const paso = anchoUtil / puntos.length;
  const anchoBarra = Math.max(3, Math.min(24, paso * 0.58));
  const puntosLinea = puntos.map((punto, indice) => ({
    x: margenIzquierdo + paso * indice + paso / 2,
    y: margenSuperior + altoUtil - (punto.valor / maximo) * altoUtil,
  }));
  const trazoLinea = puntosLinea.map(({ x, y }) => `${x},${y}`).join(' ');

  const cambiarPeriodo = (nuevoPeriodo: Periodo) => {
    setPeriodo(nuevoPeriodo);
    if (nuevoPeriodo === 'ano') setAno(Number(fecha.slice(0, 4)));
  };

  return (
    <section className="estadisticas-view">
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

      <section className="estadisticas-analisis" aria-label="Registros por periodo">
        <div className="estadisticas-analisis-header">
          <div>
            <span className="estadisticas-kicker">CRECIMIENTO DE REGISTROS</span>
            <h2>Actividad de {entidad}</h2>
          </div>
          <div className="estadisticas-periodos" role="group" aria-label="Escala del periodo">
            {(['dia', 'mes', 'ano'] as Periodo[]).map((opcion) => (
              <button
                aria-pressed={periodo === opcion}
                className={periodo === opcion ? 'activo' : ''}
                key={opcion}
                onClick={() => cambiarPeriodo(opcion)}
                type="button"
              >
                {opcion === 'ano' ? 'Año' : opcion === 'dia' ? 'Día' : 'Mes'}
              </button>
            ))}
          </div>
          <div className="estadisticas-tipos-grafica" role="group" aria-label="Tipo de gráfica">
            {(['barras', 'linea'] as TipoGrafica[]).map((tipo) => (
              <button
                aria-pressed={tipoGrafica === tipo}
                className={tipoGrafica === tipo ? 'activo' : ''}
                key={tipo}
                onClick={() => setTipoGrafica(tipo)}
                type="button"
              >
                {tipo === 'barras' ? 'Barras' : 'Línea'}
              </button>
            ))}
          </div>
        </div>

        <div className="estadisticas-analisis-controles">
          <div className="estadisticas-tabs" role="tablist" aria-label="Tipo de registro">
            {pestanas.map((pestana) => (
              <button
                aria-selected={entidad === pestana.key}
                className={entidad === pestana.key ? 'activo' : ''}
                key={pestana.key}
                onClick={() => setEntidad(pestana.key)}
                role="tab"
                type="button"
              >
                {pestana.label}
              </button>
            ))}
          </div>
          <label className="estadisticas-selector">
            <span>{periodo === 'dia' ? 'Día' : periodo === 'mes' ? 'Mes' : 'Año'}</span>
            {periodo === 'dia' ? (
              <input aria-label="Seleccionar día" type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} />
            ) : periodo === 'mes' ? (
              <input aria-label="Seleccionar mes" type="month" value={fecha.slice(0, 7)} onChange={(evento) => setFecha(`${evento.target.value}-01`)} />
            ) : (
              <select aria-label="Seleccionar año" value={ano} onChange={(evento) => setAno(Number(evento.target.value))}>
                {anosDisponibles.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
              </select>
            )}
          </label>
        </div>

        <div className="estadisticas-resumen-periodo">
          <div>
            <strong>{cargando ? '—' : totalPeriodo.toLocaleString('es')}</strong>
            <span>registros en este {periodo === 'ano' ? 'año' : periodo}</span>
          </div>
          <span className="estadisticas-rango">
            {periodo === 'dia' ? fecha : periodo === 'mes' ? new Date(`${fecha.slice(0, 7)}-02T12:00:00`).toLocaleDateString('es', { month: 'long', year: 'numeric' }) : ano}
          </span>
        </div>

        <div className="estadisticas-grafica">
          {totalPeriodo === 0 && !cargando && <p className="estadisticas-vacio">Sin registros para este periodo</p>}
          <svg aria-label={`Gráfica de ${totalPeriodo} registros de ${entidad}`} role="img" viewBox={`0 0 ${anchoGrafica} ${altoGrafica}`}>
            {[0, 1, 2, 3].map((linea) => {
              const y = margenSuperior + (altoUtil / 3) * linea;
              return <line className="estadisticas-linea-guia" key={linea} x1={margenIzquierdo} x2={anchoGrafica - margenDerecho} y1={y} y2={y} />;
            })}
            {tipoGrafica === 'linea' && <polyline className="estadisticas-trazo" points={trazoLinea} />}
            {puntos.map((punto, indice) => {
              const alto = (punto.valor / maximo) * altoUtil;
              const x = margenIzquierdo + paso * indice + (paso - anchoBarra) / 2;
              const y = margenSuperior + altoUtil - alto;
              const mostrarEtiqueta = periodo === 'dia' ? indice % 3 === 0 : periodo === 'mes' ? indice % 5 === 0 || indice === puntos.length - 1 : true;
              return (
                <g key={punto.etiqueta}>
                  {tipoGrafica === 'barras' && punto.valor > 0 && <rect className="estadisticas-barra" height={Math.max(alto, 2)} rx="3" width={anchoBarra} x={x} y={y}><title>{`${punto.valor} registros, ${punto.etiqueta}${periodo === 'dia' ? ':00' : ''}`}</title></rect>}
                  {tipoGrafica === 'linea' && (
                    <circle className="estadisticas-punto-linea" cx={puntosLinea[indice].x} cy={puntosLinea[indice].y} r="3.5">
                      <title>{`${punto.valor} registros, ${punto.etiqueta}${periodo === 'dia' ? ':00' : ''}`}</title>
                    </circle>
                  )}
                  {mostrarEtiqueta && <text className="estadisticas-etiqueta-eje" textAnchor="middle" x={puntosLinea[indice].x} y={altoGrafica - 8}>{punto.etiqueta}</text>}
                </g>
              );
            })}
          </svg>
        </div>
      </section>
    </section>
  );
}