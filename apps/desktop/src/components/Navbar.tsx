"use client";
import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { useRouter } from "next/navigation";
import { HiMenu } from "react-icons/hi";
import { HiAdjustmentsHorizontal, HiArrowPath, HiBell, HiCheck, HiXMark } from "react-icons/hi2";

interface NavbarProps {
  onSelect: (section: string) => void;
}

function SettingsModal({ onClose }: { onClose: () => void }) {
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
      className="settings-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
        <header className="settings-modal-header">
          <div className="settings-modal-heading-icon"><HiAdjustmentsHorizontal aria-hidden="true" /></div>
          <div className="settings-modal-heading-copy">
            <span className="settings-modal-eyebrow">Preferencias</span>
            <h2 id="settings-modal-title">Ajustes</h2>
            <p>Personaliza tu espacio de trabajo</p>
          </div>
          <button type="button" className="settings-modal-close" onClick={onClose} aria-label="Cerrar ajustes">
            <HiXMark aria-hidden="true" />
          </button>
        </header>

        <div className="settings-modal-content">
          <section className="settings-group" aria-labelledby="settings-theme-title">
            <div className="settings-group-heading">
              <div>
                <h3 id="settings-theme-title">Apariencia</h3>
                <p>Elige el aspecto de AnlinetDB</p>
              </div>
              <span className="settings-group-tag">INTERFAZ</span>
            </div>
            <div className="settings-theme-options">
              <div className="settings-theme-option is-selected" aria-label="Tema claro seleccionado">
                <span className="settings-theme-preview settings-theme-light"><i /><i /><i /></span>
                <span className="settings-theme-label">Claro</span>
                <HiCheck className="settings-theme-check" aria-hidden="true" />
              </div>
              <div className="settings-theme-option" aria-label="Tema oscuro">
                <span className="settings-theme-preview settings-theme-dark"><i /><i /><i /></span>
                <span className="settings-theme-label">Oscuro</span>
              </div>
              <div className="settings-theme-option" aria-label="Tema del sistema">
                <span className="settings-theme-preview settings-theme-system"><i /><i /><i /></span>
                <span className="settings-theme-label">Sistema</span>
              </div>
            </div>
          </section>

          <section className="settings-group" aria-labelledby="settings-workspace-title">
            <div className="settings-group-heading">
              <div>
                <h3 id="settings-workspace-title">Espacio de trabajo</h3>
                <p>Preferencias de visualización</p>
              </div>
            </div>
            <div className="settings-preference-row">
              <span className="settings-preference-icon"><HiAdjustmentsHorizontal aria-hidden="true" /></span>
              <span className="settings-preference-copy"><strong>Vista compacta</strong><small>Más información en pantalla</small></span>
              <span className="settings-static-switch" aria-label="Desactivado"><i /></span>
            </div>
            <div className="settings-preference-row">
              <span className="settings-preference-icon"><HiBell aria-hidden="true" /></span>
              <span className="settings-preference-copy"><strong>Notificaciones</strong><small>Avisos dentro de la aplicación</small></span>
              <span className="settings-static-switch is-on" aria-label="Activado"><i /></span>
            </div>
          </section>

          <section className="settings-update-row" aria-label="Actualizaciones">
            <div className="settings-update-icon"><HiArrowPath aria-hidden="true" /></div>
            <div className="settings-update-copy">
              <strong>Actualizaciones</strong>
              <span>Versión actual · AnlinetDB Desktop</span>
            </div>
            <button type="button" className="settings-update-button">
              <HiArrowPath aria-hidden="true" />
              Buscar
            </button>
          </section>
        </div>

        <footer className="settings-modal-footer">
          <span><i /> Tus preferencias son solo visuales</span>
          <button type="button" onClick={onClose}>Cerrar</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
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
  const [settingsOpen, setSettingsOpen] = useState(false);

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
                type="button"
                className="dashboard-settings-button"
                onClick={() => {
                  setUserMenuOpen(false);
                  setSettingsOpen(true);
                }}
              >
                <HiAdjustmentsHorizontal aria-hidden="true" />
                Ajustes
              </button>
              <button
                type="button"
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
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </nav>
  );
}
