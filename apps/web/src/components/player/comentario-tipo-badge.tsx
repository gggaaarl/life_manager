import { COMENTARIO_TIPO_LABELS, type ComentarioTipo } from "@/lib/player/constants";

const BADGE_STYLES: Record<ComentarioTipo, string> = {
  dicho: "bg-teal/15 text-teal",
  pensamiento: "bg-forest/15 text-forest",
};

export function ComentarioTipoBadge({ tipo }: { tipo: ComentarioTipo }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE_STYLES[tipo]}`}
    >
      {COMENTARIO_TIPO_LABELS[tipo]}
    </span>
  );
}

export function ComentarioTipoPicker({
  value,
  onChange,
}: {
  value: ComentarioTipo;
  onChange: (tipo: ComentarioTipo) => void;
}) {
  const tipos: ComentarioTipo[] = ["dicho", "pensamiento"];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tipos.map((tipo) => (
        <button
          key={tipo}
          type="button"
          onClick={() => onChange(tipo)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            value === tipo
              ? tipo === "pensamiento"
                ? "bg-forest text-white"
                : "bg-teal text-white"
              : "border border-line bg-white text-muted"
          }`}
        >
          {COMENTARIO_TIPO_LABELS[tipo]}
        </button>
      ))}
    </div>
  );
}
