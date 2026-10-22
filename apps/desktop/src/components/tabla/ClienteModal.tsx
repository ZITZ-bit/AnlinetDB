"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { api, getErrorMessage, type Caja, type Cliente, type Plan, type Zona } from "../../lib/api";
import { addToast } from "../toast/use-toast";
import "./tabla.css";

interface ClienteModalProps {
  cliente: Cliente;
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

export function ClienteModal({ cliente, onClose, onSave, onDelete }: ClienteModalProps) {
  const [usuario, setUsuario] = useState(cliente.usuario);
  const [cedula, setCedula] = useState(cliente.cedula ?? "");
  const [telefono, setTelefono] = useState(cliente.telefono ?? "");
  const [direccion, setDireccion] = useState(cliente.direccion);
  const [referencia, setReferencia] = useState(cliente.referencia ?? "");
  const [zonaId, setZonaId] = useState(String(cliente.zonaId));
  const [cajaId, setCajaId] = useState(cliente.cajaId ? String(cliente.cajaId) : "");
  const [planId, setPlanId] = useState(String(cliente.planId));
  const [estado, setEstado] = useState(cliente.estado);
  const [ipAsignada, setIpAsignada] = useState(cliente.ipAsignada ?? "");
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", cerrarConEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    Promise.all([api.zonas.getAll(), api.cajas.getAll(), api.planes.getAll()])
      .then(([zonasData, cajasData, planesData]) => {
        setZonas(zonasData);
        setCajas(cajasData);
        setPlanes(planesData);
      })
      .catch((error) => addToast(getErrorMessage(error, "No se pudieron cargar los datos"), "error"))
      .finally(() => setCargando(false));
  }, []);

  const guardarCliente = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (guardando) return;
    setGuardando(true);

    const data = {
      usuario: usuario.trim(),
      cedula: cedula.trim() || null,
      telefono: telefono.trim() || null,
      direccion: direccion.trim(),
      referencia: referencia.trim() || null,
      zonaId: Number(zonaId),
      cajaId: cajaId ? Number(cajaId) : null,
      planId: Number(planId),
      estado: estado.trim(),
      ipAsignada: ipAsignada.trim() || null,
    };

    try {
      const actualizado = await api.clientes.update(cliente.id, data);
      onSave({
        ...cliente,
        ...actualizado,
        ...data,
        zona: zonas.find((zona) => zona.id === data.zonaId) ?? null,
        caja: cajas.find((caja) => caja.id === data.cajaId) ?? null,
        plan: planes.find((plan) => plan.id === data.planId) ?? null,
      });
      addToast("Datos del cliente actualizados");
      onClose();
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo actualizar el cliente"), "error");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCliente = async () => {
    if (!confirm("¿Eliminar este cliente y todos sus datos?")) return;
    setEliminando(true);
    try {
      await api.clientes.remove(cliente.id);
      onDelete(cliente.id);
      addToast("Cliente eliminado");
      onClose();
    } catch (error) {
      addToast(getErrorMessage(error, "No se pudo eliminar el cliente"), "error");
    } finally {
      setEliminando(false);
    }
  };

  return createPortal(
    <div
      className="cliente-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="cliente-modal" role="dialog" aria-modal="true" aria-labelledby="cliente-modal-title">
        <header className="cliente-modal-header">
          <div>
            <span className="cliente-modal-eyebrow">Ficha del cliente</span>
            <h2 id="cliente-modal-title">{cliente.usuario}</h2>
          </div>
          <button type="button" className="cliente-modal-close" onClick={onClose} aria-label="Cerrar detalles">
            <i className="bx bx-x" aria-hidden="true" />
          </button>
        </header>
        <form className="cliente-modal-form" onSubmit={guardarCliente}>
          <label className="cliente-modal-field">
            <span>Usuario</span>
            <input required maxLength={100} value={usuario} onChange={(event) => setUsuario(event.target.value)} disabled={!editando} />
          </label>
          <label className="cliente-modal-field">
            <span>Cédula</span>
            <input maxLength={20} value={cedula} onChange={(event) => setCedula(event.target.value)} disabled={!editando} />
          </label>
          <label className="cliente-modal-field">
            <span>Teléfono</span>
            <input type="tel" maxLength={20} value={telefono} onChange={(event) => setTelefono(event.target.value)} disabled={!editando} />
          </label>
          <label className="cliente-modal-field">
            <span>Dirección</span>
            <input required maxLength={200} value={direccion} onChange={(event) => setDireccion(event.target.value)} disabled={!editando} />
          </label>
          <label className="cliente-modal-field">
            <span>Referencia</span>
            <input maxLength={200} value={referencia} onChange={(event) => setReferencia(event.target.value)} disabled={!editando} />
          </label>
          <label className="cliente-modal-field">
            <span>Zona</span>
            <select required value={zonaId} onChange={(event) => setZonaId(event.target.value)} disabled={!editando}>
              {zonas.map((zona) => <option key={zona.id} value={zona.id}>{zona.nombre}</option>)}
            </select>
          </label>
          <label className="cliente-modal-field">
            <span>Caja</span>
            <select value={cajaId} onChange={(event) => setCajaId(event.target.value)} disabled={!editando}>
              <option value="">Sin caja</option>
              {cajas.map((caja) => <option key={caja.id} value={caja.id}>{caja.codigoCaja}</option>)}
            </select>
          </label>
          <label className="cliente-modal-field">
            <span>Plan</span>
            <select required value={planId} onChange={(event) => setPlanId(event.target.value)} disabled={!editando}>
              {planes.map((plan) => <option key={plan.id} value={plan.id}>{plan.nombre}</option>)}
            </select>
          </label>
          <label className="cliente-modal-field">
            <span>Estado</span>
            <input maxLength={50} value={estado} onChange={(event) => setEstado(event.target.value)} disabled={!editando} />
          </label>
          <label className="cliente-modal-field">
            <span>IP asignada</span>
            <input value={ipAsignada} onChange={(event) => setIpAsignada(event.target.value)} disabled={!editando} />
          </label>
          <footer className="cliente-modal-actions">
            {!editando ? (
              <>
                <button type="button" className="cliente-modal-edit" onClick={() => setEditando(true)} disabled={cargando}>
                  <i className="bx bx-edit-alt" aria-hidden="true" />Editar
                </button>
                <button type="button" className="cliente-modal-delete" onClick={eliminarCliente} disabled={eliminando}>
                  <i className="bx bx-trash" aria-hidden="true" />
                  {eliminando ? "Eliminando..." : "Eliminar"}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="cliente-modal-cancel" onClick={() => setEditando(false)}>Cancelar</button>
                <button type="submit" className="cliente-modal-save" disabled={guardando || cargando}>
                  <i className={guardando ? "bx bx-loader-alt" : "bx bx-save"} aria-hidden="true" />
                  {cargando ? "Cargando datos..." : guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </>
            )}
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
