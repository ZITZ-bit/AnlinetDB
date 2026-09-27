"use client";

import { HiMenu } from "react-icons/hi";

interface NavbarProps {
  onSelect: (section: string) => void;
}

export default function Navbar({ onSelect }: NavbarProps) {
  return (
    <nav className="w-full h-16 bg-[#025F51] shadow-md">
      <div className="relative flex items-center w-full h-full px-6">

        <section className="flex-1">
          <p className="text-l font-bold text-white tracking-wide">Usuario</p>
        </section>

        <section className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10 text-white font-medium">
          <button type="button" onClick={() => onSelect("Inicio")} className="cursor-pointer relative transition-colors duration-300 hover:text-[#4cc7b4] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">
            Inicio
          </button>

          <button type="button" onClick={() => onSelect("RegistroCliente")} className="cursor-pointer relative transition-colors duration-300 hover:text-[#4cc7b4] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">
            Registrar Cliente
          </button>

          <button type="button" onClick={() => onSelect("CrearCajas")} className="cursor-pointer relative transition-colors duration-300 hover:text-[#4cc7b4] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">
            Crear Caja
          </button>

          <button type="button" onClick={() => onSelect("Cajas")} className="cursor-pointer relative transition-colors duration-300 hover:text-[#4cc7b4] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">
            Ver Cajas
          </button>
        </section>

        <section className="flex justify-end flex-1">

          <button className="group">
            <HiMenu className="text-white text-3xl transition-all duration-300 ease-in-out group-hover:rotate-90 group-hover:scale-110"/>
          </button>
          
        </section>
    
      </div>
    </nav>
  );
}
