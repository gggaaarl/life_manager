import type { ReactNode } from "react";
import { ComentarioTipoBadge } from "@/components/player/comentario-tipo-badge";
import {
  COLOR_LABELS,
  FIGURA_LABELS,
  TALLA_LABELS,
  type ComentarioTipo,
  type PlayerColor,
  type PlayerFigura,
  type PlayerTalla,
} from "@/lib/player/constants";
import { formatComentario, formatFechaCorta, formatPersona } from "@/lib/player/format";

export type CitaRow = {
  id: string;
  fecha: string;
  persona: string;
  caracteristica: string | null;
  color: PlayerColor;
  talla: PlayerTalla;
  figura: PlayerFigura;
  lugar: string;
  puntaje_promedio: number;
  comentarios: Array<{
    id: string;
    contenido: string;
    tipo: ComentarioTipo;
  }>;
};

export function CitasTable({ citas }: { citas: CitaRow[] }) {
  if (citas.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <p className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
          Sin citas todavía
        </p>
        <p className="mt-2 text-sm text-muted">Agrega la primera desde el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-sand/50 text-xs uppercase tracking-[0.12em] text-muted">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Persona</th>
              <th className="px-4 py-3 font-semibold">Característica</th>
              <th className="px-4 py-3 font-semibold">Color</th>
              <th className="px-4 py-3 font-semibold">Talla</th>
              <th className="px-4 py-3 font-semibold">Figura</th>
              <th className="px-4 py-3 font-semibold">Lugar</th>
              <th className="px-4 py-3 font-semibold">Prom.</th>
              <th className="px-4 py-3 font-semibold">Comentarios</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id} className="border-b border-line/80 align-top last:border-b-0">
                <td className="whitespace-nowrap px-4 py-4 text-ink">
                  {formatFechaCorta(cita.fecha)}
                </td>
                <td className="px-4 py-4 font-medium text-ink">{formatPersona(cita.persona)}</td>
                <td className="max-w-xs px-4 py-4 text-muted">{cita.caracteristica ?? "—"}</td>
                <td className="px-4 py-4">
                  <Tag>{COLOR_LABELS[cita.color]}</Tag>
                </td>
                <td className="px-4 py-4">
                  <Tag>{TALLA_LABELS[cita.talla]}</Tag>
                </td>
                <td className="px-4 py-4">
                  <Tag>{FIGURA_LABELS[cita.figura]}</Tag>
                </td>
                <td className="px-4 py-4 text-ink">{cita.lugar}</td>
                <td className="px-4 py-4 font-[family-name:var(--font-display)] text-base font-bold text-teal">
                  {Number(cita.puntaje_promedio).toFixed(0)}
                </td>
                <td className="max-w-md px-4 py-4">
                  <div className="space-y-2">
                    {cita.comentarios.map((comentario) => (
                      <div key={comentario.id} className="flex flex-wrap items-start gap-2">
                        <ComentarioTipoBadge tipo={comentario.tipo} />
                        <span className="text-ink">{formatComentario(comentario.contenido)}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink">
      {children}
    </span>
  );
}
