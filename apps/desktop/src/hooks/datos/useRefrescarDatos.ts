"use client";

import { useEffect, useRef } from "react";

import { EVENTO_DATOS_ACTUALIZADOS } from "../../lib/eventos";

export function useRefrescarDatos(callback: () => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = () => callbackRef.current();
    window.addEventListener(EVENTO_DATOS_ACTUALIZADOS, handler);
    return () => window.removeEventListener(EVENTO_DATOS_ACTUALIZADOS, handler);
  }, []);
}
