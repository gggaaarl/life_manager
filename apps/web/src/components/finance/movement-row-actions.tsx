"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteMovement, updateMovement } from "@/app/finance/actions";
import {
  FINANCE_MANUAL_EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@life-manager/shared/finance/constants";

type Props = {
  movementId: string;
  label: string;
  amount: number;
  editableCategory?: boolean;
  category?: string | null;
};

export function MovementRowActions({
  movementId,
  label,
  amount,
  editableCategory = false,
  category,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "edit" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  const foodCategory =
    category === "comida" || category === "bebida"
      ? category
      : category === "comida_bebida"
        ? "comida"
        : "comida";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
        setMode(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function closeAll() {
    setOpen(false);
    setMode(null);
    setError(null);
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        aria-label="Acciones"
        onClick={() => {
          setOpen((value) => !value);
          setMode("menu");
          setError(null);
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:bg-sand hover:text-ink"
      >
        <ThreeDotsIcon />
      </button>

      {open && mode === "menu" ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[8.5rem] overflow-hidden rounded-lg border border-line bg-panel py-1 shadow-lg">
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-sand/70"
            onClick={() => setMode("edit")}
          >
            Editar
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-[var(--lm-danger)] hover:bg-sand/70"
            onClick={() => setMode("delete")}
          >
            Borrar
          </button>
        </div>
      ) : null}

      {open && mode === "edit" ? (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-line bg-panel p-3 shadow-lg">
          <p className="mb-2 text-xs font-semibold text-ink">Editar movimiento</p>
          <form
            action={(formData) => {
              setError(null);
              formData.set("movement_id", movementId);
              startTransition(async () => {
                try {
                  await updateMovement(formData);
                  closeAll();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Error.");
                }
              });
            }}
            className="space-y-2"
          >
            <input
              name="label"
              defaultValue={label}
              required
              placeholder="Descripción"
              className="w-full rounded border border-line bg-sand px-2 py-1.5 text-sm"
            />
            <input
              name="amount_soles"
              type="number"
              step="0.01"
              min={0}
              defaultValue={amount}
              required
              className="w-full rounded border border-line bg-sand px-2 py-1.5 text-sm tabular-nums"
            />
            {editableCategory ? (
              <select
                name="category"
                defaultValue={foodCategory}
                className="w-full rounded border border-line bg-sand px-2 py-1.5 text-sm"
              >
                {FINANCE_MANUAL_EXPENSE_CATEGORIES.filter((c) => c !== "otro").map((value) => (
                  <option key={value} value={value}>
                    {EXPENSE_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            ) : null}
            {error ? <p className="text-xs text-[var(--lm-danger)]">{error}</p> : null}
            <div className="flex gap-1 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded bg-teal px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {pending ? "…" : "Guardar"}
              </button>
              <button
                type="button"
                onClick={closeAll}
                className="rounded border border-line px-2 py-1.5 text-xs text-muted"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {open && mode === "delete" ? (
        <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-line bg-panel p-3 shadow-lg">
          <p className="text-sm text-ink">¿Borrar este movimiento?</p>
          <p className="mt-1 truncate text-xs text-muted">{label}</p>
          {error ? <p className="mt-2 text-xs text-[var(--lm-danger)]">{error}</p> : null}
          <div className="mt-3 flex gap-1">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  try {
                    await deleteMovement(movementId);
                    closeAll();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Error.");
                  }
                });
              }}
              className="flex-1 rounded bg-[var(--lm-danger)] px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {pending ? "…" : "Borrar"}
            </button>
            <button
              type="button"
              onClick={closeAll}
              className="rounded border border-line px-2 py-1.5 text-xs text-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ThreeDotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}
