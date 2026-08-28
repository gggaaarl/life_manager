"use client";

import { useState, useTransition } from "react";
import { endDriverShift, startDriverShift } from "@/app/finance/actions";
import { formatDuration } from "@life-manager/shared/finance/summaries";
import type { DriverShiftRow } from "@life-manager/shared/finance/summaries";

type Props = {
  workDate: string;
  shifts: DriverShiftRow[];
};

export function DriverShiftForms({ workDate, shifts }: Props) {
  return (
    <div className="space-y-4">
      <StartShiftForm workDate={workDate} nextNumber={(shifts.at(-1)?.shift_number ?? 0) + 1} />
      {shifts
        .filter((shift) => !shift.ended_at)
        .map((shift) => (
          <EndShiftForm key={shift.id} shift={shift} />
        ))}
    </div>
  );
}

function StartShiftForm({
  workDate,
  nextNumber,
}: {
  workDate: string;
  nextNumber: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await startDriverShift(formData);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="rounded-2xl bg-panel p-5 border border-line/60"
    >
      <p className="font-semibold text-ink">Iniciar vuelta {nextNumber}</p>
      <input type="hidden" name="work_date" value={workDate} />
      <input type="hidden" name="shift_number" value={nextNumber} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Inicio</span>
          <input
            required
            type="time"
            name="started_at_time"
            className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Descanso previo (min)</span>
          <input
            type="number"
            min={0}
            name="break_minutes"
            defaultValue={0}
            className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2"
          />
        </label>
      </div>
      <textarea
        name="notes"
        rows={2}
        placeholder="Notas (ej. barra 5→2 verdes, barra 1 roja)"
        className="mt-3 w-full rounded-xl border border-line bg-sand/40 px-3 py-2 text-sm"
      />
      {error ? <p className="mt-2 text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : `Abrir vuelta ${nextNumber}`}
      </button>
    </form>
  );
}

function EndShiftForm({ shift }: { shift: DriverShiftRow }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await endDriverShift(formData);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="rounded-2xl border-2 border-teal/30 bg-panel p-5"
    >
      <p className="font-semibold text-ink">
        Cerrar vuelta {shift.shift_number} (en curso)
      </p>
      <input type="hidden" name="shift_id" value={shift.id} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Fin</span>
          <input
            required
            type="time"
            name="ended_at_time"
            className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Descansos en vuelta (min)</span>
          <input
            type="number"
            min={0}
            name="break_minutes"
            defaultValue={shift.break_minutes}
            className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2"
          />
        </label>
      </div>
      {error ? <p className="mt-2 text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Cerrar vuelta"}
      </button>
    </form>
  );
}

export function ShiftSummaryCard({
  shift,
  income,
  expenses,
  workedMinutes,
}: {
  shift: DriverShiftRow;
  income: number;
  expenses: number;
  workedMinutes: number;
}) {
  const net = income - expenses;

  return (
    <div className="rounded-2xl bg-panel p-4 border border-line/60">
      <p className="font-semibold text-ink">Vuelta {shift.shift_number}</p>
      <p className="mt-1 text-xs text-muted">
        {shift.notes ?? "Sin notas"}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted">Horas netas</dt>
          <dd className="font-medium">{formatDuration(workedMinutes)}</dd>
        </div>
        <div>
          <dt className="text-muted">Descanso</dt>
          <dd className="font-medium">{shift.break_minutes} min</dd>
        </div>
        <div>
          <dt className="text-muted">Ingresos</dt>
          <dd className="font-semibold text-forest">S/ {income.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-muted">Gastos</dt>
          <dd className="font-semibold">S/ {expenses.toFixed(2)}</dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-line/60 pt-3 text-sm">
        <span className="text-muted">Líquido vuelta: </span>
        <span className={`font-bold ${net >= 0 ? "text-forest" : "text-[var(--lm-danger)]"}`}>
          S/ {net.toFixed(2)}
        </span>
      </p>
    </div>
  );
}
