"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import { updateCita } from "@/app/player/citas/actions";
import { ComentarioTipoBadge, ComentarioTipoPicker } from "@/components/player/comentario-tipo-badge";
import {
  COLOR_LABELS,
  FIGURA_LABELS,
  PLAYER_COLORS,
  PLAYER_FIGURAS,
  PLAYER_PRESIONES,
  PLAYER_TALLAS,
  PRESION_LABELS,
  TALLA_LABELS,
  type ComentarioTipo,
  type PlayerColor,
  type PlayerFigura,
  type PlayerPresion,
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
  presion: PlayerPresion;
  lugar: string;
  puntaje_promedio: number;
  puntaje_tightening: number;
  puntaje_bottom: number;
  puntaje_top: number;
  puntaje_belleza: number;
  puntaje_paciencia: number;
  comentarios: Array<{
    id: string;
    contenido: string;
    tipo: ComentarioTipo;
  }>;
};

type ComentarioDraft = {
  id: string;
  contenido: string;
  tipo: ComentarioTipo;
};

export function CitasTable({ citas }: { citas: CitaRow[] }) {
  const [editing, setEditing] = useState<CitaRow | null>(null);

  if (citas.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <p className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
          Sin salidas todavía
        </p>
        <p className="mt-2 text-sm text-muted">Agrega la primera desde el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-sand/50 text-xs uppercase tracking-[0.12em] text-muted">
                <th className="px-3 py-3 font-semibold"> </th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Persona</th>
                <th className="px-4 py-3 font-semibold">Característica</th>
                <th className="px-4 py-3 font-semibold">Color</th>
                <th className="px-4 py-3 font-semibold">Talla</th>
                <th className="px-4 py-3 font-semibold">Figura</th>
                <th className="px-4 py-3 font-semibold">Presión</th>
                <th className="px-4 py-3 font-semibold">Lugar</th>
                <th className="px-4 py-3 font-semibold">Prom.</th>
                <th className="px-4 py-3 font-semibold">Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id} className="border-b border-line/80 align-top last:border-b-0">
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => setEditing(cita)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-sand hover:text-teal"
                      aria-label="Editar salida"
                      title="Editar"
                    >
                      <PencilIcon />
                    </button>
                  </td>
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
                  <td className="px-4 py-4">
                    <Tag>{PRESION_LABELS[cita.presion]}</Tag>
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

      {editing ? (
        <EditCitaModal cita={editing} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}

function EditCitaModal({ cita, onClose }: { cita: CitaRow; onClose: () => void }) {
  const fechaValue = useMemo(() => cita.fecha.slice(0, 10), [cita.fecha]);
  const [comentarios, setComentarios] = useState<ComentarioDraft[]>(
    cita.comentarios.length > 0
      ? cita.comentarios.map((item) => ({
          id: item.id,
          contenido: item.contenido,
          tipo: item.tipo,
        }))
      : [{ id: crypto.randomUUID(), contenido: "", tipo: "dicho" }],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateComentario(id: string, patch: Partial<ComentarioDraft>) {
    setComentarios((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("cita_id", cita.id);
    formData.set("comentario_count", String(comentarios.length));
    comentarios.forEach((comentario, index) => {
      formData.set(`comentario_id_${index}`, comentario.id);
      formData.set(`comentario_contenido_${index}`, comentario.contenido);
      formData.set(`comentario_tipo_${index}`, comentario.tipo);
    });

    startTransition(async () => {
      try {
        await updateCita(formData);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al actualizar.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
              Editar salida
            </p>
            <p className="text-sm text-muted">{formatPersona(cita.persona)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-sand"
          >
            Cerrar
          </button>
        </div>

        <form action={handleSubmit} className="space-y-5 px-5 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Fecha</span>
              <input
                required
                type="date"
                name="fecha"
                defaultValue={fechaValue}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Persona</span>
              <input
                required
                type="text"
                name="persona"
                defaultValue={cita.persona}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-ink">Característica</span>
              <textarea
                name="caracteristica"
                rows={2}
                defaultValue={cita.caracteristica ?? ""}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Color</span>
              <select
                name="color"
                defaultValue={cita.color}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              >
                {PLAYER_COLORS.map((value) => (
                  <option key={value} value={value}>
                    {COLOR_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Talla</span>
              <select
                name="talla"
                defaultValue={cita.talla}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              >
                {PLAYER_TALLAS.map((value) => (
                  <option key={value} value={value}>
                    {TALLA_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Figura</span>
              <select
                name="figura"
                defaultValue={cita.figura}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              >
                {PLAYER_FIGURAS.map((value) => (
                  <option key={value} value={value}>
                    {FIGURA_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Presión</span>
              <select
                name="presion"
                defaultValue={cita.presion}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              >
                {PLAYER_PRESIONES.map((value) => (
                  <option key={value} value={value}>
                    {PRESION_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-ink">Lugar</span>
              <input
                required
                type="text"
                name="lugar"
                defaultValue={cita.lugar}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">
              Puntajes (PROM. se recalcula solo)
            </p>
            <div className="grid gap-3 sm:grid-cols-5">
              {(
                [
                  ["puntaje_tightening", "Tightening", cita.puntaje_tightening],
                  ["puntaje_bottom", "Bottom", cita.puntaje_bottom],
                  ["puntaje_top", "Top", cita.puntaje_top],
                  ["puntaje_belleza", "Belleza", cita.puntaje_belleza],
                  ["puntaje_paciencia", "Paciencia", cita.puntaje_paciencia],
                ] as const
              ).map(([name, label, defaultValue]) => (
                <label key={name} className="block text-sm">
                  <span className="mb-1 block text-muted">{label}</span>
                  <input
                    required
                    type="number"
                    min={1}
                    max={100}
                    name={name}
                    defaultValue={defaultValue}
                    className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Comentarios</p>
              <button
                type="button"
                onClick={() =>
                  setComentarios((current) => [
                    ...current,
                    { id: crypto.randomUUID(), contenido: "", tipo: "dicho" },
                  ])
                }
                className="rounded-lg border border-line px-3 py-1.5 text-sm text-teal"
              >
                + Comentario
              </button>
            </div>
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="rounded-xl border border-line bg-sand/30 p-4">
                <div className="mb-3">
                  <ComentarioTipoPicker
                    value={comentario.tipo}
                    onChange={(tipo) => updateComentario(comentario.id, { tipo })}
                  />
                </div>
                <textarea
                  rows={2}
                  value={comentario.contenido}
                  onChange={(event) =>
                    updateComentario(comentario.id, { contenido: event.target.value })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none focus:border-teal"
                />
              </div>
            ))}
          </div>

          {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-teal px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
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

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
