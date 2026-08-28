"use client";

import { useState, useTransition } from "react";
import { setOpeningBalances } from "@/app/finance/actions";

export function OpeningBalanceForm({ hasOpeningBalance }: { hasOpeningBalance: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (hasOpeningBalance) {
    return null;
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await setOpeningBalances(formData);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="space-y-3 rounded-2xl border border-teal/30 bg-panel p-5"
    >
      <p className="font-semibold text-ink">Configura tu capital inicial</p>
      <p className="text-sm text-muted">
        Ejemplo: S/ 1 en Yape y S/ 10 en efectivo = S/ 11 total.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Yape S/</span>
          <input type="number" step="0.01" min={0} name="yape" defaultValue={0} className="w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Plin S/</span>
          <input type="number" step="0.01" min={0} name="plin" defaultValue={0} className="w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Efectivo S/</span>
          <input type="number" step="0.01" min={0} name="efectivo" defaultValue={0} className="w-full rounded-xl border border-line px-3 py-2" />
        </label>
      </div>
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Guardando…" : "Guardar capital inicial"}
      </button>
    </form>
  );
}
