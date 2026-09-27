"use client";

import { FaDatabase } from "react-icons/fa";
import { AiOutlineMinus, AiOutlineUpSquare, AiOutlineClose } from "react-icons/ai";
import { useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    api: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const pathname = usePathname();
  const cleanPath = pathname.replace(/\/$/, "");
  const isAuthPage = cleanPath === "" || cleanPath === "/ui/Registro";

  const handleMaximize = () => {
    window.api.maximize();
    setIsMaximized((prev) => !prev);
  };

  const handleMinimize = () => {
    window.api.minimize();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => window.api.close(), 250);
  };

  return (
    <div
      className={`w-full h-9 flex items-center justify-between pl-3 select-none border-b border-white/20 transition-colors duration-300 ${isAuthPage ? "bg-white text-black" : "bg-[#025F51] text-gray-100"}`}
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Título */}
      <section className="flex items-center gap-2 text-sm font-normal tracking-wide">
        AnlinetDB
        <FaDatabase className={`text-base transition-all duration-500 hover:scale-110 hover:rotate-3 ${isAuthPage ? "text-black" : "text-white"}`} />
      </section>

      {/* Botones */}
      <section className="flex"       style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        
        {/* Minimizar */}
        <button
          onClick={handleMinimize}
          className="group w-11 h-9 flex items-center justify-center hover:bg-gray-300/40 transition-all duration-200"
        >
          <AiOutlineMinus className={`text-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:-translate-y-0.5 ${isAuthPage ? "text-black" : "text-white"}`} />
        </button>

        {/* Maximizar */}
        <button
          onClick={handleMaximize}
          className="group w-11 h-9 flex items-center justify-center hover:bg-gray-300/40 transition-all duration-200"
        >
          <AiOutlineUpSquare className={`text-lg transition-all duration-300 ease-in-out ${isMaximized ? "group-hover:scale-110 group-hover:rotate-3" : "group-hover:scale-110"} ${isAuthPage ? "text-black" : "text-white"}`} />
        </button>

        {/* Cerrar */}
        <button
          onClick={handleClose}
          className="group w-11 h-9 flex items-center justify-center hover:bg-red-600 transition-all duration-200"
        >
          {isClosing ? (
            <AiOutlineClose className={`text-lg transition-all duration-300 ease-in-out animate-spin ${isAuthPage ? "text-black" : "text-white"}`} />
          ) : (
            <AiOutlineClose className={`text-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12 ${isAuthPage ? "text-black" : "text-white"}`} />
          )}
        </button>

      </section>
    </div>
  );
}
