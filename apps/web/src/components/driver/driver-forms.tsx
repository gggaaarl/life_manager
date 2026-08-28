"use client";

import { useState, useTransition } from "react";
import { logDriverExpense, logDriverIncome } from "@/app/finance/actions";
import {
  DRIVER_EXPENSE_CATEGORIES,
  DRIVER_EXPENSE_CATEGORY_LABELS,
  GNV_BARS,
  GNV_BAR_LABELS,
  gnvBarTone,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@life-manager/shared/finance/constants";
import { nowTimeInLima } from "@life-manager/shared/finance/summaries";
import type { DriverShiftRow } from "@life-manager/shared/finance/summaries";

type Props = {
  workDate: string;
  shifts: DriverShiftRow[];
};

export function DriverForms({ workDate, shifts }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DriverIncomeForm workDate={workDate} shifts={shifts} />
      <DriverExpenseForm workDate={workDate} shifts={shifts} />
    </div>
  );
}

function DriverIncomeForm({
  workDate,
  shifts,
}: {
  workDate: string;
  shifts: DriverShiftRow[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const defaultShift = shifts.find((s) => !s.ended_at)?.id ?? shifts.at(-1)?.id ?? "";

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await logDriverIncome(formData);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="space-y-3 rounded-2xl bg-panel p-5 border border-line/60"
    >
      <p className="font-semibold text-ink">Ingreso de carrera</p>
      <input
        required
        type="number"
        step="0.01"
        min={0}
        name="amount_soles"
        placeholder="Monto S/"
        className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
      />
      <select
        required
        name="gnv_bar"
        defaultValue="5"
        className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
      >
        {GNV_BARS.map((bar) => (
          <option key={bar} value={bar}>
            {GNV_BAR_LABELS[bar]} {gnvBarTone(bar) === "red" ? "🔴" : "🟢"}
          </option>
        ))}
      </select>
      <select required name="payment_method" defaultValue="yape" className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm">
        {PAYMENT_METHODS.filter((m) => m !== "otro").map((value) => (
          <option key={value} value={value}>
            {PAYMENT_METHOD_LABELS[value]}
          </option>
        ))}
      </select>
      {shifts.length > 0 ? (
        <select
          name="driver_shift_id"
          defaultValue={defaultShift}
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
        >
          {shifts.map((shift) => (
            <option key={shift.id} value={shift.id}>
              Vuelta {shift.shift_number}
              {shift.ended_at ? " (cerrada)" : " (activa)"}
            </option>
          ))}
        </select>
      ) : null}
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
      <textarea
        name="notes"
        rows={2}
        placeholder="Notas opcionales"
        className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Guardando…" : "Registrar ingreso"}
      </button>
    </form>
  );
}

function DriverExpenseForm({
  workDate,
  shifts,
}: {
  workDate: string;
  shifts: DriverShiftRow[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const defaultShift = shifts.find((s) => !s.ended_at)?.id ?? shifts.at(-1)?.id ?? "";

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await logDriverExpense(formData);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="space-y-3 rounded-2xl bg-panel p-5 border border-line/60"
    >
      <p className="font-semibold text-ink">Gasto del vehículo</p>
      <select required name="category" defaultValue="combustible_gnv" className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm">
        {DRIVER_EXPENSE_CATEGORIES.map((value) => (
          <option key={value} value={value}>
            {DRIVER_EXPENSE_CATEGORY_LABELS[value]}
          </option>
        ))}
      </select>
      <input
        name="label"
        placeholder="Ej. Recarga GNV, saldo Yango, llantas"
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
      <select name="payment_method" defaultValue="yape" className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm">
        {PAYMENT_METHODS.map((value) => (
          <option key={value} value={value}>
            {PAYMENT_METHOD_LABELS[value]}
          </option>
        ))}
      </select>
      {shifts.length > 0 ? (
        <select
          name="driver_shift_id"
          defaultValue={defaultShift}
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
        >
          <option value="">Sin vuelta</option>
          {shifts.map((shift) => (
            <option key={shift.id} value={shift.id}>
              Vuelta {shift.shift_number}
            </option>
          ))}
        </select>
      ) : null}
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
