"use client";

import { useState, useTransition } from "react";
import { createCita } from "@/app/player/citas/actions";
import {
  BELLEZA_LABELS,
  BOTTOM_LABELS,
  COLOR_LABELS,
  FIGURA_LABELS,
  PLAYER_BELLEZAS,
  PLAYER_BOTTOMS,
  PLAYER_COLORS,
  PLAYER_FIGURAS,
  PLAYER_PRESIONES,
  PLAYER_TALLAS,
  PLAYER_TOPS,
  PRESION_LABELS,
  TALLA_LABELS,
  TOP_LABELS,
  type ComentarioTipo,
} from "@/lib/player/constants";
import { ComentarioTipoPicker } from "@/components/player/comentario-tipo-badge";

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

  function deleteComentario(id: string) {
    if (!window.confirm("¿Eliminar comentario?")) {
      return;
    }
    setComentarios((current) => current.filter((item) => item.id !== id));
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
            Nueva salida
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
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
              <span className="mb-1 block font-medium text-ink">Belleza</span>
              <select
                name="belleza"
                defaultValue="regular"
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              >
                {PLAYER_BELLEZAS.map((value) => (
                  <option key={value} value={value}>
                    {BELLEZA_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Top</span>
              <select
                name="top"
                defaultValue="regular"
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              >
                {PLAYER_TOPS.map((value) => (
                  <option key={value} value={value}>
                    {TOP_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Bottom</span>
              <select
                name="bottom"
                defaultValue="regular"
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              >
                {PLAYER_BOTTOMS.map((value) => (
                  <option key={value} value={value}>
                    {BOTTOM_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Presión</span>
              <select
                name="presion"
                defaultValue="regular"
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              >
                {PLAYER_PRESIONES.map((value) => (
                  <option key={value} value={value}>
                    {PRESION_LABELS[value]}
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
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Paciencia (min)</span>
              <input
                required
                type="number"
                min={0}
                name="paciencia_minutos"
                defaultValue={0}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink">Puntaje</span>
              <input
                required
                type="number"
                min={1}
                max={100}
                name="puntaje"
                defaultValue={50}
                className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Comentarios</p>
              <button
                type="button"
                onClick={() => setComentarios((current) => [...current, newComentario()])}
                className="rounded-lg border border-line px-3 py-1.5 text-sm text-teal"
              >
                + Comentario
              </button>
            </div>

            {comentarios.map((comentario) => (
              <div
                key={comentario.id}
                className="rounded-xl border border-line bg-sand/30 p-4"
              >
                <div className="mb-3">
                  <ComentarioTipoPicker
                    value={comentario.tipo}
                    onChange={(tipo) => updateComentario(comentario.id, { tipo })}
                    onDelete={() => deleteComentario(comentario.id)}
                  />
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
              className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Guardando..." : "Guardar salida"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
