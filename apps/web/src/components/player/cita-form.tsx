"use client";

import { useState, useTransition } from "react";
import { createCita } from "@/app/player/citas/actions";
import {
  COLOR_LABELS,
  COMENTARIO_TIPO_LABELS,
  COMENTARIO_TIPOS,
  FIGURA_LABELS,
  PLAYER_COLORS,
  PLAYER_FIGURAS,
  PLAYER_TALLAS,
  TALLA_LABELS,
  type ComentarioTipo,
} from "@/lib/player/constants";

type ComentarioDraft = {
  id: string;
  contenido: string;
  tipo: ComentarioTipo;
};

function newComentario(): ComentarioDraft {
  return {
    id: crypto.randomUUID(),
    contenido: "",
    tipo: "dicho",
  };
}

export function CitaForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioDraft[]>([newComentario()]);
  const [pending, startTransition] = useTransition();

  function updateComentario(id: string, patch: Partial<ComentarioDraft>) {
    setComentarios((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("comentario_count", String(comentarios.length));
    comentarios.forEach((comentario, index) => {
      formData.set(`comentario_contenido_${index}`, comentario.contenido);
      formData.set(`comentario_tipo_${index}`, comentario.tipo);
    });

    startTransition(async () => {
      try {
        await createCita(formData);
        setOpen(false);
        setComentarios([newComentario()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar.");
      }
    });
  }

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
            Nueva cita
          </p>
          <p className="mt-1 text-sm text-muted">
            Persona con &apos; &apos;, dichos con &quot; &quot;, pensamientos con ( ) y badge.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {open ? "Cerrar" : "Agregar"}
        </button>
      </div>

      {open ? (
        <form action={handleSubmit} className="space-y-6 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Fecha</span>
              <input
                required
                type="date"
                name="fecha"
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Persona</span>
              <input
                required
                type="text"
                name="persona"
                placeholder="Gladys de al fondo sitio joven"
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-ink">Característica</span>
              <textarea
                name="caracteristica"
                rows={2}
                placeholder="charapa pomulos pronunciados tetonas cuerpo fit"
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Color</span>
              <select
                name="color"
                defaultValue="canela"
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
                defaultValue="caballo"
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
                defaultValue="vedette"
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
              <span className="mb-1 block font-medium text-ink">Lugar</span>
              <input
                required
                type="text"
                name="lugar"
                placeholder="bote"
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-ink">Puntajes (1–100)</p>
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                ["puntaje_tightening", "Tightening", 90],
                ["puntaje_bottom", "Bottom", 90],
                ["puntaje_top", "Top", 90],
                ["puntaje_belleza", "Belleza", 90],
                ["puntaje_paciencia", "Paciencia", 90],
              ].map(([name, label, defaultValue]) => (
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
                onClick={() => setComentarios((current) => [...current, newComentario()])}
                className="rounded-full border border-line px-3 py-1.5 text-sm text-teal"
              >
                + Comentario
              </button>
            </div>

            {comentarios.map((comentario) => (
              <div
                key={comentario.id}
                className="rounded-xl border border-line bg-sand/30 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {COMENTARIO_TIPOS.map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => updateComentario(comentario.id, { tipo })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        comentario.tipo === tipo
                          ? tipo === "pensamiento"
                            ? "bg-forest text-white"
                            : "bg-teal text-white"
                          : "border border-line bg-white text-muted"
                      }`}
                    >
                      {COMENTARIO_TIPO_LABELS[tipo]}
                    </button>
                  ))}
                  {comentario.tipo === "pensamiento" ? (
                    <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
                      ( ) interno
                    </span>
                  ) : null}
                </div>
                <textarea
                  rows={2}
                  value={comentario.contenido}
                  onChange={(event) =>
                    updateComentario(comentario.id, { contenido: event.target.value })
                  }
                  placeholder={
                    comentario.tipo === "pensamiento"
                      ? "que tal cocomordan en misionero"
                      : "se ve que me va a lastimar"
                  }
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none focus:border-teal"
                />
              </div>
            ))}
          </div>

          {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Guardando..." : "Guardar cita"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
