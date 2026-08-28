import { formatSoles } from "@life-manager/shared/finance/constants";

type Props = {
  totalIncome: number;
  totalExpense: number;
  title?: string;
};

export function DayBalanceCard({
  totalIncome,
  totalExpense,
  title = "Balance del día",
}: Props) {
  const balance = totalIncome - totalExpense;

  return (
    <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-line bg-sand/50 px-3 py-2">
          <p className="text-xs text-muted">Ingresos</p>
          <p className="text-base font-semibold tabular-nums text-forest">
            {formatSoles(totalIncome)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-sand/50 px-3 py-2">
          <p className="text-xs text-muted">Egresos</p>
          <p className="text-base font-semibold tabular-nums text-ink">
            {formatSoles(totalExpense)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-teal/10 px-3 py-2">
          <p className="text-xs text-muted">Balance</p>
          <p className="text-base font-semibold tabular-nums text-teal">
            {formatSoles(balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
