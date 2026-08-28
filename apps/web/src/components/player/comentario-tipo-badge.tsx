import { COMENTARIO_TIPO_LABELS, type ComentarioTipo } from "@life-manager/shared/player/constants";

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
  onDelete,
}: {
  value: ComentarioTipo;
  onChange: (tipo: ComentarioTipo) => void;
  onDelete?: () => void;
}) {
  const tipos: ComentarioTipo[] = ["dicho", "pensamiento"];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
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
                : "border border-line bg-panel text-muted"
            }`}
          >
            {COMENTARIO_TIPO_LABELS[tipo]}
          </button>
        ))}
      </div>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-panel hover:text-[var(--lm-danger)]"
          aria-label="Eliminar comentario"
          title="Eliminar comentario"
        >
          <TrashIcon />
        </button>
      ) : null}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
