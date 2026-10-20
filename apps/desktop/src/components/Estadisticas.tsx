'use client';

import { useEffect, useState } from 'react';
import { api, type Caja, type Cliente, type Mensualidad, type Zona } from '@/lib/api';
import EstadisticasVista from '@/features/Estadisticas/EstadisticasVista';

export default function Estadisticas() {
  const [totales, setTotales] = useState({ clientes: 0, cajas: 0, zonas: 0, mensualidades: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.clientes.getAll(),
      api.cajas.getAll(),
      api.zonas.getAll(),
      api.mensualidades.getAll(),
    ])
      .then(([clientes, cajas, zonas, mensualidades]: [Cliente[], Caja[], Zona[], Mensualidad[]]) => {
        setTotales({
          clientes: clientes.length,
          cajas: cajas.length,
          zonas: zonas.length,
          mensualidades: mensualidades.length,
        });
      })
      .catch(() => setTotales({ clientes: 0, cajas: 0, zonas: 0, mensualidades: 0 }))
      .finally(() => setCargando(false));
  }, []);

  return <EstadisticasVista totales={totales} cargando={cargando} />;
}