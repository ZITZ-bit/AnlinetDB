"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { DeveloperModal } from "./developer/DeveloperModal";
import { MenuActions } from "./navbar/MenuActions";
import { NavLinks } from "./navbar/NavLinks";
import { SettingsModal } from "./navbar/SettingsModal";
import { UserMenu } from "./navbar/UserMenu";

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

interface NavbarProps {
  onSelect: (section: string) => void;
}

export default function Navbar({ onSelect }: NavbarProps) {
  const usuarioNombre = useSyncExternalStore(
    subscribeToSession,
    getUsuarioNombre,
    () => "Usuario"
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [developerOpen, setDeveloperOpen] = useState(false);
  const [developerMode, setDeveloperMode] = useState<boolean | null>(null);

  useEffect(() => {
    const readDeveloperMode = () => {
      setDeveloperMode(localStorage.getItem("anlinet:developer-mode") !== "false");
    };

    readDeveloperMode();
    window.addEventListener("storage", readDeveloperMode);
    return () => window.removeEventListener("storage", readDeveloperMode);
  }, []);

  const updateDeveloperMode = (enabled: boolean) => {
    localStorage.setItem("anlinet:developer-mode", String(enabled));
    setDeveloperMode(enabled);
  };

  return (
    <nav className="relative z-50 w-full border-b border-white/15 bg-[#025f51] text-[#f5fbf8]">
      <div className="mx-auto grid h-[5.4rem] max-w-[1600px] grid-cols-[1fr_auto] grid-rows-[2.65rem_2.75rem] items-center px-3 md:flex md:h-16 md:px-6">
        <UserMenu usuarioNombre={usuarioNombre} onOpenSettings={() => setSettingsOpen(true)} />
        <NavLinks onSelect={onSelect} developerMode={developerMode === true} onOpenDeveloper={() => setDeveloperOpen(true)} />
        <MenuActions onSelect={onSelect} />
      </div>

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          developerMode={developerMode === true}
          onDeveloperModeChange={updateDeveloperMode}
        />
      )}
      {developerOpen && <DeveloperModal onClose={() => setDeveloperOpen(false)} />}

    </nav>
  );
}
