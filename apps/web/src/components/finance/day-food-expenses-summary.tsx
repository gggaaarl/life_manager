import { formatSoles } from "@life-manager/shared/finance/constants";

export function DayFoodExpensesSummary({ total }: { total: number }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
            Egresos del día
          </h2>
          <p className="text-xs text-muted">Gastos personales</p>
        </div>
        <p className="text-sm font-semibold tabular-nums text-ink">{formatSoles(total)}</p>
      </div>
    </section>
  );
}
