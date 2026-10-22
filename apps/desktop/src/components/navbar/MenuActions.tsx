"use client";

import { useRef, useState } from "react";
import { HiMenu } from "react-icons/hi";

interface MenuActionsProps {
  onSelect: (section: string) => void;
}

export function MenuActions({ onSelect }: MenuActionsProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMenuOpen(true);
  };

  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 200);
  };

  const handleSelect = (section: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMenuOpen(false);
    onSelect(section);
  };

  return (
    <section className="col-start-2 row-start-1 flex items-center justify-end md:flex-1">
      <div
        ref={menuAnchorRef}
        className="flex h-full items-center px-2 md:px-5"
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
      >
        <button className="grid h-10 w-10 place-items-center bg-transparent text-[#f5fbf8] transition hover:bg-white/10 focus-visible:bg-white/10" aria-label="Abrir menú">
          <HiMenu className="text-[1.45rem]" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-30 w-56 overflow-hidden border border-white/20 bg-[#01483e] shadow-[0_14px_28px_rgba(17,44,37,0.2)]">
            <div className="flex flex-col">
              <button type="button" className="flex min-h-11 w-full items-center bg-transparent px-4 py-2.5 text-left text-sm text-[#f5fbf8] transition hover:bg-[#0a7564]" onClick={() => handleSelect("RegistroCliente")}>
                Registrar Cliente
              </button>
              <button type="button" className="flex min-h-11 w-full items-center bg-transparent px-4 py-2.5 text-left text-sm text-[#f5fbf8] transition hover:bg-[#0a7564]" onClick={() => handleSelect("CrearCajas")}>
                Crear Caja
              </button>
              <button type="button" className="flex min-h-11 w-full items-center bg-transparent px-4 py-2.5 text-left text-sm text-[#f5fbf8] transition hover:bg-[#0a7564]" onClick={() => handleSelect("CrearPlanCorte")}>
                Planes y Cortes
              </button>
              <button type="button" className="flex min-h-11 w-full items-center bg-transparent px-4 py-2.5 text-left text-sm text-[#f5fbf8] transition hover:bg-[#0a7564]" onClick={() => handleSelect("RegistrarZona")}>
                Registrar Zona
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
