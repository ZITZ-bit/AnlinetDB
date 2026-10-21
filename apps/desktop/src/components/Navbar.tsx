"use client";
import { useState, useRef, useEffect, useSyncExternalStore } from "react";

import { useRouter } from "next/navigation";
import { HiMenu } from "react-icons/hi";

interface NavbarProps {
  onSelect: (section: string) => void;
}

function subscribeToSession(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getUsuarioNombre() {
  try {
    const session = JSON.parse(localStorage.getItem("anlinet:session") || "{}");
    return session.nombre || session.usuario || "Usuario";
  } catch {
    return "Usuario";
  }
}

export default function Navbar({ onSelect }: NavbarProps) {
  const router = useRouter();
  const usuarioNombre = useSyncExternalStore(
    subscribeToSession,
    getUsuarioNombre,
    () => "Usuario",
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userAnchorRef = useRef<HTMLElement | null>(null);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);
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

  const openUserMenu = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current);
      userTimeoutRef.current = null;
    }
    setUserMenuOpen(true);
  };

  const closeUserMenu = () => {
    userTimeoutRef.current = setTimeout(() => setUserMenuOpen(false), 200);
  };

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!userAnchorRef.current?.contains(target)) setUserMenuOpen(false);
      if (!menuAnchorRef.current?.contains(target)) setMenuOpen(false);
    };

    document.addEventListener("click", closeOnOutsideClick);
    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current);
    };
  }, []);

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
        <section
          ref={userAnchorRef}
          className="dashboard-nav-user"
          onMouseEnter={openUserMenu}
          onMouseLeave={closeUserMenu}
        >
          <button
            className="dashboard-user-button"
            aria-expanded={userMenuOpen}
          >
            {usuarioNombre}
          </button>

          {userMenuOpen && (
            <div className="dashboard-dropdown dashboard-user-dropdown">
              <button
                onClick={() => {
                  localStorage.removeItem("anlinet:session");
                  localStorage.removeItem("token");
                  setUserMenuOpen(false);
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

          <button type="button" onClick={() => onSelect("Cajas")} className="dashboard-nav-link">
            Ver Cajas
          </button>

          <button type="button" onClick={() => onSelect("Estadisticas")} className="dashboard-nav-link">
            Estadísticas
          </button>
        </section>

        <section className="dashboard-nav-actions">
          <div
            ref={menuAnchorRef}
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
                    onClick={() => handleSelect("RegistroCliente")}
                  >
                    Registrar Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect("CrearCajas")}
                  >
                    Crear Caja
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect("CrearPlanCorte")}
                  >
                    Planes y Cortes
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
