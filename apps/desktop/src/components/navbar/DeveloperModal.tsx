"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HiCodeBracket, HiCube, HiExclamationTriangle, HiMap, HiTrash, HiUsers } from "react-icons/hi2";

interface DeveloperModalProps {
  onClose: () => void;
}

const developerActions = [
  {
    title: "Clientes y datos relacionados",
    description: "Registros de clientes y toda su información asociada.",
    button: "Limpiar clientes",
    icon: HiUsers,
  },
  {
    title: "Cajas",
    description: "Registros de cajas e información de capacidad.",
    button: "Limpiar cajas",
    icon: HiCube,
  },
  {
    title: "Zonas",
    description: "Zonas registradas y sus datos de ubicación.",
    button: "Limpiar zonas",
    icon: HiMap,
  },
  {
    title: "Planes",
    description: "Planes de servicio y detalles asociados.",
    button: "Limpiar planes",
    icon: HiTrash,
  },
];

export function DeveloperModal({ onClose }: DeveloperModalProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#13231e]/60 p-5 max-sm:items-end max-sm:p-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="flex max-h-[90vh] w-full max-w-[720px] flex-col overflow-hidden rounded-md border border-[#d8c9f2] border-t-4 border-t-[#7040b8] bg-white text-[#2f2440] shadow-[0_30px_90px_rgba(40,22,70,0.36)] max-sm:max-h-[92vh] max-sm:rounded-t-lg max-sm:rounded-b-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="developer-modal-title"
      >
        <header className="relative flex shrink-0 items-start gap-4 overflow-hidden border-b border-[#4a3270] bg-[#251638] px-6 py-5 text-white max-sm:gap-3 max-sm:px-4 max-sm:py-4">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#7546b8]/35 to-transparent" />
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-[#7959a8] bg-[#3e285f] text-[#eadbff]">
            <HiCodeBracket aria-hidden="true" className="text-xl" />
          </div>
          <div className="relative flex-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#c7a9f5]">
              Consola de desarrollo
            </span>
            <h2 id="developer-modal-title" className="mt-1 text-xl font-semibold text-white">
              Desarrollador
            </h2>
            <p className="mt-1 text-sm text-[#d1c3e5]">Herramientas para administrar datos de prueba</p>
          </div>
          <span className="relative mt-1 border border-[#7959a8] bg-[#3e285f] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#eadbff] max-sm:hidden">
            MODO DEV
          </span>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto bg-[#fbf8f7] px-6 py-5 max-sm:gap-3 max-sm:px-4 max-sm:py-4">
          <div className="flex items-start gap-3 border border-[#e6b9b5] bg-[#fff0ee] px-4 py-3 text-[#9d302b]">
            <HiExclamationTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-lg" />
            <div>
              <strong className="text-sm font-semibold">Zona de mantenimiento</strong>
              <p className="text-sm text-[#824642]">Las opciones están desconectadas y no borran información.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {developerActions.map((action) => {
              const Icon = action.icon;
              return (
                <article
                  className="flex min-w-0 flex-col gap-4 border border-[#eadad8] border-l-[3px] border-l-[#c73535] bg-white p-4 shadow-[0_2px_8px_rgba(74,27,25,0.04)] transition hover:border-[#d5aaa6] hover:shadow-[0_6px_18px_rgba(74,27,25,0.09)]"
                  key={action.title}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#f0d8d5] bg-[#fff2f0] text-[#a6312e]">
                      <Icon aria-hidden="true" className="text-lg" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#392524]">{action.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#806b69]">{action.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex min-h-9 w-full shrink-0 items-center justify-center gap-2 border border-[#e2b7b3] bg-[#fff7f6] px-3 py-2 text-xs font-semibold text-[#a6312e] transition hover:border-[#c73535] hover:bg-[#ffefed]"
                  >
                    <HiTrash aria-hidden="true" />
                    {action.button}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#eadad8] bg-white px-6 py-4 max-sm:px-4">
          <span className="flex items-center gap-2 text-xs text-[#806b69]">
            <span className="h-1.5 w-1.5 shrink-0 bg-[#c73535]" />
            Consola visual · sin acciones conectadas
          </span>
          <button
            type="button"
            className="shrink-0 border border-[#a6312e] bg-[#a6312e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#812522]"
            onClick={onClose}
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
