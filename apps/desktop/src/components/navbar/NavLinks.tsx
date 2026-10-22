"use client";

interface NavLinksProps {
  onSelect: (section: string) => void;
  developerMode: boolean;
  onOpenDeveloper: () => void;
}

export function NavLinks({ onSelect, developerMode, onOpenDeveloper }: NavLinksProps) {
  const linkClass = "group relative h-full shrink-0 bg-transparent px-1 text-[0.84rem] font-medium text-[#f5fbf8] transition hover:text-[#a8e7d6] focus-visible:text-[#a8e7d6] max-md:text-[0.72rem]";
  const underlineClass = "absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#8ed9c7] transition-transform group-hover:scale-x-100 group-focus-visible:scale-x-100";

  return (
    <section className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 items-center justify-center gap-[clamp(1rem,2.4vw,2.25rem)] whitespace-nowrap max-md:static max-md:col-span-2 max-md:row-start-2 max-md:h-full max-md:translate-x-0 max-md:gap-[clamp(0.5rem,2vw,1rem)] max-md:overflow-x-auto max-md:px-2 max-md:[scrollbar-width:none]">
      <button type="button" onClick={() => onSelect("Inicio")} className={linkClass}>
        <span className={underlineClass} />
        Inicio
      </button>
      <button type="button" onClick={() => onSelect("Cajas")} className={linkClass}>
        <span className={underlineClass} />
        Ver Cajas
      </button>
      <button type="button" onClick={() => onSelect("Estadisticas")} className={linkClass}>
        <span className={underlineClass} />
        Estadísticas
      </button>
      {developerMode && (
        <button type="button" onClick={onOpenDeveloper} className={linkClass}>
          <span className={underlineClass} />
          Desarrollador
        </button>
      )}
    </section>
  );
}
