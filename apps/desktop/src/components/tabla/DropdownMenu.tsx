"use client";

import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./tabla.css";

interface DropdownMenuProps {
  children: ReactNode;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

export function DropdownMenu({ children, buttonRef, onClose }: DropdownMenuProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = menuRef.current?.offsetWidth || 272;
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - menuWidth - 12));
      setPosition({ top: rect.bottom + 6, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) onClose();
    };
    document.addEventListener("click", closeOnOutsideClick);
    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, [buttonRef, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="dashboard-month-menu fixed z-50"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    document.body,
  );
}
