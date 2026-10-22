"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";

interface UserMenuProps {
  usuarioNombre: string;
  onOpenSettings: () => void;
}

export function UserMenu({ usuarioNombre, onOpenSettings }: UserMenuProps) {
  const router = useRouter();
  const userTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userAnchorRef = useRef<HTMLElement | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  return (
    <section
      ref={userAnchorRef}
      className="col-start-1 row-start-1 flex items-center md:ml-6"
      onMouseEnter={openUserMenu}
      onMouseLeave={closeUserMenu}
    >
      <button className="bg-transparent py-2 text-[0.92rem] font-semibold text-[#f5fbf8] transition hover:text-[#a8e7d6]" aria-expanded={userMenuOpen}>
        {usuarioNombre}
      </button>

      {userMenuOpen && (
        <div className="absolute left-0 top-full z-30 w-48 overflow-hidden border border-white/20 bg-[#01483e] shadow-[0_14px_28px_rgba(17,44,37,0.2)]">
          <button
            type="button"
            className="flex min-h-11 w-full items-center gap-3 bg-transparent px-4 py-2.5 text-left text-sm text-[#f5fbf8] transition hover:bg-[#0a7564]"
            onClick={() => {
              setUserMenuOpen(false);
              onOpenSettings();
            }}
          >
            <HiAdjustmentsHorizontal aria-hidden="true" className="text-[#a8e7d6]" />
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
            className="flex min-h-11 w-full items-center gap-3 border-t border-white/15 bg-transparent px-4 py-2.5 text-left text-sm text-[#ffc2b9] transition hover:bg-[#753f39]"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </section>
  );
}
