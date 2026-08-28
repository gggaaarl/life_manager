"use client";

import { useState, useTransition } from "react";
import {
  logManualExpense,
  logManualIncome,
} from "@/app/finance/actions";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@life-manager/shared/finance/constants";

import { nowTimeInLima } from "@life-manager/shared/finance/summaries";

export function FinanceForms({ workDate }: { workDate: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ExpenseForm workDate={workDate} />
      <IncomeForm workDate={workDate} />
    </div>
  );
}

function ExpenseForm({ workDate }: { workDate: string }) {
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
      className="space-y-3 rounded-2xl bg-panel p-5 border border-line/60"
    >
      <p className="font-semibold text-ink">Gasto manual</p>
      <input
        required
        name="label"
        placeholder="Descripción"
        className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
      />
      <input
        required
        type="number"
        step="0.01"
        min={0}
        name="amount_soles"
        placeholder="Monto S/"
        className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
      />
      <select name="category" defaultValue="otro" className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm">
        {EXPENSE_CATEGORIES.map((value) => (
          <option key={value} value={value}>
            {EXPENSE_CATEGORY_LABELS[value]}
          </option>
        ))}
      </select>
      <select name="payment_method" className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm">
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
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
        />
        <input
          type="time"
          name="hora"
          defaultValue={nowTimeInLima()}
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Guardando…" : "Registrar gasto"}
      </button>
    </form>
  );
}

function IncomeForm({ workDate }: { workDate: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await logManualIncome(formData);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="space-y-3 rounded-2xl bg-panel p-5 border border-line/60"
    >
      <p className="font-semibold text-ink">Ingreso manual</p>
      <input
        required
        name="label"
        placeholder="Ej. freelance web, sueldo estado"
        className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
      />
      <input
        required
        type="number"
        step="0.01"
        min={0}
        name="amount_soles"
        placeholder="Monto S/"
        className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
      />
      <select required name="payment_method" defaultValue="yape" className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm">
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
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
        />
        <input
          type="time"
          name="hora"
          defaultValue={nowTimeInLima()}
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Guardando…" : "Registrar ingreso"}
      </button>
    </form>
  );
}
