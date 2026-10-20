"use client";
import { useState, useRef } from "react";

import { useRouter } from "next/navigation";
import { HiMenu } from "react-icons/hi";

interface NavbarProps {
  onSelect: (section: string) => void;
}

export default function Navbar({ onSelect }: NavbarProps) {
  const router = useRouter();
  const [usuarioNombre] = useState(() => {
    if (typeof window === "undefined") return "Usuario";

    try {
      const session = JSON.parse(localStorage.getItem("anlinet:session") || "{}");
      return session.nombre || session.usuario || "Usuario";
    } catch {
      return "Usuario";
    }
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
    <nav className="dashboard-nav">
      <div className="dashboard-nav-layout">
        <section className="dashboard-nav-user">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="dashboard-user-button"
          >
            {usuarioNombre}
          </button>

          {userMenuOpen && (
            <div className="dashboard-user-menu">
              <button
                onClick={() => {
                  localStorage.removeItem("anlinet:session");
                  localStorage.removeItem("token");
                  router.push("/");
                }}
                className="dashboard-logout-button"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </section>

        <section className="dashboard-nav-links">
          <button type="button" onClick={() => onSelect("Inicio")} className="dashboard-nav-link">
            Inicio
          </button>

          <button type="button" onClick={() => onSelect("RegistroCliente")} className="dashboard-nav-link">
            Registrar Cliente
          </button>

          <button type="button" onClick={() => onSelect("CrearCajas")} className="dashboard-nav-link">
            Crear Caja
          </button>

          <button type="button" onClick={() => onSelect("Cajas")} className="dashboard-nav-link">
            Ver Cajas
          </button>
        </section>

        <section className="dashboard-nav-actions">
          <div
            className="dashboard-menu-anchor"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
          >
            <button className="dashboard-menu-button" aria-label="Abrir menú">
              <HiMenu />
            </button>
            
            {menuOpen && (
              <div className="dashboard-dropdown">
                <div>
                  <button
                    type="button"
                    onClick={() => handleSelect("CrearPlanMensualidad")}
                  >
                    Planes y Mensualidades
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect("RegistrarZona")}
                  >
                    Registrar Zona
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </nav>
  );
}
