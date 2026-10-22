'use client';

import { useEffect, useState } from 'react';
import { api, type Caja, type Cliente, type Corte, type Zona } from '@/lib/api';
import EstadisticasVista from '@/features/Estadisticas/EstadisticasVista';
import { useRefrescarDatos } from '@/hooks/datos/useRefrescarDatos';

export default function Estadisticas() {
  const [totales, setTotales] = useState({ clientes: 0, cajas: 0, zonas: 0, cortes: 0 });
  const [cargando, setCargando] = useState(true);

  const cargarTotales = () => {
    Promise.all([
      api.clientes.getAll(),
      api.cajas.getAll(),
      api.zonas.getAll(),
      api.cortes.getAll(),
    ])
      .then(([clientes, cajas, zonas, cortes]: [Cliente[], Caja[], Zona[], Corte[]]) => {
        setTotales({
          clientes: clientes.length,
          cajas: cajas.length,
          zonas: zonas.length,
          cortes: cortes.length,
        });
      })
      .catch(() => setTotales({ clientes: 0, cajas: 0, zonas: 0, cortes: 0 }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarTotales();
  }, []);

  useRefrescarDatos(() => {
    setCargando(true);
    cargarTotales();
  });

  return <EstadisticasVista totales={totales} cargando={cargando} />;
}