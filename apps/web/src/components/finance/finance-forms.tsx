"use client";

import { useState, useTransition } from "react";
import { logManualExpense } from "@/app/finance/actions";
import {
  FINANCE_MANUAL_EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
} from "@life-manager/shared/finance/constants";
import { nowTimeInLima } from "@life-manager/shared/finance/summaries";

type PaymentAccountOption = {
  id: string;
  label: string;
};

export function FinanceForms({
  workDate,
  paymentAccounts,
}: {
  workDate: string;
  paymentAccounts: PaymentAccountOption[];
}) {
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
      className="space-y-3 rounded-xl border border-line bg-panel p-4 shadow-sm"
    >
      <p className="font-semibold text-ink">Registrar gasto</p>
      <input
        required
        name="label"
        placeholder="Descripción"
        className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
      />
      <input
        required
        type="number"
        step="0.01"
        min={0}
        name="amount_soles"
        placeholder="Monto"
        className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
      />
      <select name="category" defaultValue="comida" className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm">
        {FINANCE_MANUAL_EXPENSE_CATEGORIES.map((value) => (
          <option key={value} value={value}>
            {EXPENSE_CATEGORY_LABELS[value]}
          </option>
        ))}
      </select>
      <select
        name="payment_account_id"
        className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
      >
        <option value="">Sin cuenta</option>
        {paymentAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.label}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          name="fecha"
          defaultValue={workDate}
          className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
        />
        <input
          type="time"
          name="hora"
          defaultValue={nowTimeInLima()}
          className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar gasto"}
      </button>
    </form>
  );
}
