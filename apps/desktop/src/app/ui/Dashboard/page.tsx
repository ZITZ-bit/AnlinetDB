'use client';

import { useState } from "react";

import Navbar from "@/components/Navbar";
import Tabla from "@/components/Tabla";

import RegistroCliente from "@/features/RegistroCliente/RegistroCliente";
import CrearCajas from "@/features/CrearCajas/CrearCajas";

import "../../../styles/dashboard.css";

export default function Dashboard() {
  const[activeSection, setActiveSection] = useState("Inicio");

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <Navbar onSelect={setActiveSection} />
      </header>

      <main className="dashboard-main">
        {activeSection === "Inicio" && <Tabla />}
        {activeSection === "RegistroCliente" && <RegistroCliente />}
        {activeSection === "CrearCajas" && <CrearCajas />}
      </main>
      
    </div>
  );
}
