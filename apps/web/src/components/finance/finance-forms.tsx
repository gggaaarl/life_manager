"use client";

import { useState, useTransition } from "react";
import { logManualExpense } from "@/app/finance/actions";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@life-manager/shared/finance/constants";
import { nowTimeInLima } from "@life-manager/shared/finance/summaries";

export function FinanceForms({ workDate }: { workDate: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await logManualExpense(formData);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="space-y-3 border border-ink/80 bg-panel p-4"
    >
      <p className="font-semibold text-ink">Registrar gasto</p>
      <input
        required
        name="label"
        placeholder="Descripción"
        className="w-full border border-ink/80 bg-sand px-3 py-2 text-sm"
      />
      <input
        required
        type="number"
        step="0.01"
        min={0}
        name="amount_soles"
        placeholder="Monto"
        className="w-full border border-ink/80 bg-sand px-3 py-2 text-sm"
      />
      <select name="category" defaultValue="otro" className="w-full border border-ink/80 bg-sand px-3 py-2 text-sm">
        {EXPENSE_CATEGORIES.map((value) => (
          <option key={value} value={value}>
            {EXPENSE_CATEGORY_LABELS[value]}
          </option>
        ))}
      </select>
      <select name="payment_method" className="w-full border border-ink/80 bg-sand px-3 py-2 text-sm">
        <option value="">Sin método</option>
        {PAYMENT_METHODS.map((value) => (
          <option key={value} value={value}>
            {PAYMENT_METHOD_LABELS[value]}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          name="fecha"
          defaultValue={workDate}
          className="w-full border border-ink/80 bg-sand px-3 py-2 text-sm"
        />
        <input
          type="time"
          name="hora"
          defaultValue={nowTimeInLima()}
          className="w-full border border-ink/80 bg-sand px-3 py-2 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="border border-ink/80 bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar gasto"}
      </button>
    </form>
  );
}
