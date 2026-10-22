"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HiAdjustmentsHorizontal, HiArchiveBox, HiArrowDownTray, HiArrowPath, HiBell, HiCheck, HiChevronDown, HiClock, HiCodeBracket, HiPaintBrush } from "react-icons/hi2";

interface SettingsModalProps {
  onClose: () => void;
  developerMode: boolean;
  onDeveloperModeChange: (enabled: boolean) => void;
}

export function SettingsModal({ onClose, developerMode, onDeveloperModeChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"sistema" | "temas" | "backups" | "actualizacion">("sistema");
  const [selectedTheme, setSelectedTheme] = useState("Claro");
  const [backupFrequency, setBackupFrequency] = useState("Cada semana");
  const [frequencyMenuOpen, setFrequencyMenuOpen] = useState(false);
  const buttonMotion = "transition duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04a777]/40";

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
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#13231e]/60 p-5 max-sm:items-end max-sm:p-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-md border border-[#cbd9d1] border-t-4 border-t-[#04a777] bg-white text-[#18342f] shadow-[0_28px_80px_rgba(13,34,27,0.32)] max-sm:max-h-[92vh] max-sm:rounded-t-lg max-sm:rounded-b-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <header className="flex shrink-0 items-start gap-4 border-b border-[#e3ebe7] bg-gradient-to-r from-[#edf6f1] to-[#f9fbfa] px-6 py-5 max-sm:gap-3 max-sm:px-4 max-sm:py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#c8e2d3] bg-[#e2f2e9] text-[#075c4c]">
            <HiAdjustmentsHorizontal aria-hidden="true" className="text-lg" />
          </div>
          <div className="flex-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#50806b]">
              Preferencias
            </span>
            <h2 id="settings-modal-title" className="mt-1 text-xl font-semibold text-[#075c4c]">
              Ajustes
            </h2>
            <p className="mt-1 text-sm text-[#657570]">Personaliza tu espacio de trabajo</p>
          </div>
        </header>

        <nav className="flex shrink-0 gap-1 border-b border-[#d7e2de] bg-[#f6f9f7] px-6 pt-2 max-sm:px-3" role="tablist" aria-label="Secciones de ajustes">
          <button type="button" role="tab" aria-selected={activeTab === "sistema"} onClick={() => setActiveTab("sistema")} className={`${buttonMotion} flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold max-sm:px-2.5 ${activeTab === "sistema" ? "border-[#025f51] text-[#025f51]" : "border-transparent text-[#657570] hover:text-[#18342f]"}`}>
            <HiAdjustmentsHorizontal aria-hidden="true" /><span className="max-sm:hidden">Sistema</span><span className="sm:hidden">Sis.</span>
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "temas"} onClick={() => setActiveTab("temas")} className={`${buttonMotion} flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold max-sm:px-2.5 ${activeTab === "temas" ? "border-[#025f51] text-[#025f51]" : "border-transparent text-[#657570] hover:text-[#18342f]"}`}>
            <HiPaintBrush aria-hidden="true" />Temas
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "backups"} onClick={() => setActiveTab("backups")} className={`${buttonMotion} flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold max-sm:px-2.5 ${activeTab === "backups" ? "border-[#025f51] text-[#025f51]" : "border-transparent text-[#657570] hover:text-[#18342f]"}`}>
            <HiArchiveBox aria-hidden="true" />Backups
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "actualizacion"} onClick={() => setActiveTab("actualizacion")} className={`${buttonMotion} flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold max-sm:px-2.5 ${activeTab === "actualizacion" ? "border-[#025f51] text-[#025f51]" : "border-transparent text-[#657570] hover:text-[#18342f]"}`}>
            <HiArrowPath aria-hidden="true" /><span className="max-sm:hidden">Actualización</span><span className="sm:hidden">App</span>
          </button>
        </nav>

        <div className="flex min-h-[350px] flex-col gap-4 overflow-y-auto px-6 py-5 max-sm:min-h-[320px] max-sm:px-4 max-sm:py-4">
          {activeTab === "sistema" && <section className="flex flex-col" aria-labelledby="settings-system-title" role="tabpanel">
            <div className="pb-4">
              <h3 id="settings-system-title" className="text-base font-semibold text-[#18342f]">Opciones del sistema</h3>
              <p className="mt-1 text-sm text-[#657570]">Controla las herramientas disponibles en la aplicación</p>
            </div>
            <div className="flex items-center gap-4 border-y border-[#e3ebe7] py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#f0eafa] text-[#7040b8]">
                <HiCodeBracket aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <strong className="text-sm text-[#18342f]">Modo desarrollador</strong>
                <p className="text-sm text-[#657570]">Muestra u oculta el acceso Desarrollador en el navbar</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={developerMode}
                aria-label="Modo desarrollador"
                onClick={() => onDeveloperModeChange(!developerMode)}
                className={`${buttonMotion} relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ${developerMode ? "justify-end bg-[#7040b8]" : "justify-start bg-[#d6dcd8]"}`}
              >
                <span className="mx-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-150" />
              </button>
            </div>
          </section>}

          {activeTab === "temas" && <section className="flex flex-col" aria-labelledby="settings-theme-title" role="tabpanel">
            <div className="flex items-start justify-between gap-4 border-b border-[#e3ebe7] pb-4">
              <div>
                <h3 id="settings-theme-title" className="text-base font-semibold text-[#18342f]">
                  Temas
                </h3>
                <p className="mt-1 text-sm text-[#657570]">Apariencia de la aplicación</p>
              </div>
              <span className="border border-[#d7e2de] bg-[#f3f7f5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#527064]">
                INTERFAZ
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 py-4 max-sm:gap-2">
              <button type="button" onClick={() => setSelectedTheme("Claro")} aria-pressed={selectedTheme === "Claro"} className={`${buttonMotion} group relative flex flex-col items-center gap-3 border px-4 py-4 text-center ${selectedTheme === "Claro" ? "border-[#358568] bg-[#f3f8f5] shadow-[0_0_0_2px_rgba(53,133,104,0.1)]" : "border-[#d7e2de] bg-white hover:border-[#9bb9ae]"}`}>
                <span className="flex h-16 w-24 flex-col overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-inner">
                  <span className="h-3 w-full bg-[#f8fafc]" />
                  <span className="flex flex-1 gap-1 p-1">
                    <span className="w-4 rounded bg-[#e5e7eb]/70" />
                    <span className="flex-1 rounded bg-[#f1f5f9]" />
                  </span>
                </span>
                <span className="text-sm font-medium text-[#18342f]">Claro</span>
                {selectedTheme === "Claro" && <HiCheck className="absolute right-3 top-3 text-lg text-[#075c4c]" aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => setSelectedTheme("Oscuro")} aria-pressed={selectedTheme === "Oscuro"} className={`${buttonMotion} relative flex flex-col items-center gap-3 border px-4 py-4 text-center ${selectedTheme === "Oscuro" ? "border-[#358568] bg-[#f3f8f5] shadow-[0_0_0_2px_rgba(53,133,104,0.1)]" : "border-[#d7e2de] bg-white hover:border-[#9bb9ae]"}`}>
                <span className="flex h-16 w-24 flex-col overflow-hidden rounded-lg border border-[#1f2937] bg-[#0f172a] shadow-inner">
                  <span className="h-3 w-full bg-[#111827]" />
                  <span className="flex flex-1 gap-1 p-1">
                    <span className="w-4 rounded bg-[#1f2937]" />
                    <span className="flex-1 rounded bg-[#111827]" />
                  </span>
                </span>
                <span className="text-sm font-medium text-[#111827]">Oscuro</span>
                {selectedTheme === "Oscuro" && <HiCheck className="absolute right-3 top-3 text-lg text-[#075c4c]" aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => setSelectedTheme("Sistema")} aria-pressed={selectedTheme === "Sistema"} className={`${buttonMotion} relative flex flex-col items-center gap-3 border px-4 py-4 text-center ${selectedTheme === "Sistema" ? "border-[#358568] bg-[#f3f8f5] shadow-[0_0_0_2px_rgba(53,133,104,0.1)]" : "border-[#d7e2de] bg-white hover:border-[#9bb9ae]"}`}>
                <span className="flex h-16 w-24 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-inner">
                  <span className="flex h-full w-1/2 flex-col">
                    <span className="h-3 w-full bg-[#f8fafc]" />
                    <span className="flex flex-1 gap-1 p-1">
                      <span className="w-2 rounded bg-[#e5e7eb]/70" />
                      <span className="flex-1 rounded bg-[#f1f5f9]" />
                    </span>
                  </span>
                  <span className="flex h-full w-1/2 flex-col bg-[#0f172a]">
                    <span className="h-3 w-full bg-[#111827]" />
                    <span className="flex flex-1 gap-1 p-1">
                      <span className="w-2 rounded bg-[#1f2937]" />
                      <span className="flex-1 rounded bg-[#111827]" />
                    </span>
                  </span>
                </span>
                <span className="text-sm font-medium text-[#111827]">Sistema</span>
                {selectedTheme === "Sistema" && <HiCheck className="absolute right-3 top-3 text-lg text-[#075c4c]" aria-hidden="true" />}
              </button>
            </div>
          </section>}

          {activeTab === "backups" && <section className="flex flex-col" aria-labelledby="settings-backup-title" role="tabpanel">
            <div className="flex items-start justify-between gap-4 border-b border-[#e3ebe7] pb-4">
              <div>
                <h3 id="settings-backup-title" className="text-base font-semibold text-[#18342f]">
                  Copias de seguridad
                </h3>
                <p className="mt-1 text-sm text-[#657570]">Administra copias locales de tus datos</p>
              </div>
              <HiArchiveBox className="mt-1 text-xl text-[#025f51]" aria-hidden="true" />
            </div>
            <div className="flex flex-col divide-y divide-[#e3ebe7]">
              <div className="flex items-center gap-4 py-4 max-sm:flex-wrap">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e8f4f0] text-[#025f51]"><HiArchiveBox aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <strong className="text-sm text-[#18342f]">Crear copia ahora</strong>
                  <p className="text-sm text-[#657570]">Guarda una copia manual de los datos</p>
                </div>
                <button type="button" className={`${buttonMotion} inline-flex items-center gap-2 border border-[#d7e2de] px-3 py-2 text-sm font-semibold text-[#025f51] hover:bg-[#e8f4f0] max-sm:ml-14`}><HiArchiveBox aria-hidden="true" />Crear backup</button>
              </div>
              <div className="flex items-center gap-4 py-4 max-sm:flex-wrap">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e8f4f0] text-[#025f51]"><HiArrowDownTray aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <strong className="text-sm text-[#18342f]">Importar backup</strong>
                  <p className="text-sm text-[#657570]">Restaura desde un archivo de copia</p>
                </div>
                <button type="button" className={`${buttonMotion} inline-flex items-center gap-2 border border-[#d7e2de] px-3 py-2 text-sm font-semibold text-[#025f51] hover:bg-[#e8f4f0] max-sm:ml-14`}><HiArrowDownTray aria-hidden="true" />Importar archivo</button>
              </div>
              <div className="flex items-center gap-4 py-4 max-sm:flex-wrap">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e8f4f0] text-[#025f51]"><HiClock aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <strong className="text-sm text-[#18342f]">Backups automáticos</strong>
                  <p className="text-sm text-[#657570]">Frecuencia programada</p>
                </div>
                <div className="relative shrink-0">
                  <button type="button" aria-haspopup="listbox" aria-expanded={frequencyMenuOpen} onClick={() => setFrequencyMenuOpen((open) => !open)} className={`${buttonMotion} inline-flex min-w-36 items-center justify-between gap-3 border border-[#cbd8d1] bg-white px-3 py-2.5 text-left text-sm font-semibold text-[#334a40] shadow-sm hover:border-[#6b9a83] hover:bg-[#f8fbf9] max-sm:min-w-32`}>
                    <span className="flex items-center gap-2"><HiClock className="text-[#025f51]" aria-hidden="true" />{backupFrequency}</span>
                    <HiChevronDown className={`text-[#657570] transition-transform duration-150 ${frequencyMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                  {frequencyMenuOpen && (
                    <div role="listbox" aria-label="Frecuencia de backups" className="absolute right-0 top-[calc(100%+0.4rem)] z-20 w-44 overflow-hidden border border-[#d7e2de] bg-white py-1 shadow-[0_12px_28px_rgba(17,44,37,0.16)]">
                      {["Cada día", "Cada semana", "Cada mes"].map((frequency) => (
                        <button key={frequency} type="button" role="option" aria-selected={backupFrequency === frequency} onClick={() => { setBackupFrequency(frequency); setFrequencyMenuOpen(false); }} className={`${buttonMotion} flex w-full items-center justify-between px-3 py-2.5 text-left text-sm ${backupFrequency === frequency ? "bg-[#e8f4f0] font-semibold text-[#025f51]" : "text-[#40564e] hover:bg-[#f5f8f6]"}`}>
                          {frequency}
                          {backupFrequency === frequency && <HiCheck aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-[#e3ebe7] py-3 text-xs text-[#657570]">
              <HiBell aria-hidden="true" className="shrink-0 text-[#025f51]" />Los controles son solo visuales; no se realizan copias ni importaciones.
            </div>
          </section>}

          {activeTab === "actualizacion" && <section className="flex flex-col" aria-labelledby="settings-updates-title" role="tabpanel">
            <div className="border-b border-[#e3ebe7] pb-4">
              <h3 id="settings-updates-title" className="text-base font-semibold text-[#18342f]">Actualizaciones</h3>
              <p className="mt-1 text-sm text-[#657570]">Información de versión de AnlinetDB Desktop</p>
            </div>
            <div className="flex items-center gap-4 py-4 max-sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#e8f4f0] text-[#025f51]">
                <HiArrowPath aria-hidden="true" />
              </div>
              <div className="flex-1">
                <strong className="text-sm text-[#18342f]">AnlinetDB Desktop</strong>
                <p className="text-sm text-[#657570]">Versión actual</p>
              </div>
              <button type="button" onClick={async () => { const r = await (window as any).api?.updateApp?.(); alert(r?.ok ? "Actualizado" : "Error: " + (r?.error || "")); }} className={`${buttonMotion} inline-flex shrink-0 items-center gap-2 border border-[#d7e2de] px-4 py-2 text-sm font-medium text-[#025f51] hover:bg-[#e8f4f0] max-sm:px-2.5`}>
                <HiArrowPath aria-hidden="true" />
                <span>Buscar actualización</span>
              </button>
            </div>
          </section>}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[#dfe8e3] bg-white px-6 py-4 max-sm:px-4">
          <span className="flex items-center gap-2 text-sm text-[#657570]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#04a777]" />
            Tus preferencias son solo visuales
          </span>
          <button
            type="button"
            className={`${buttonMotion} border border-[#025f51] bg-[#025f51] px-5 py-2 text-sm font-semibold text-white hover:bg-[#01483e]`}
            onClick={onClose}
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
