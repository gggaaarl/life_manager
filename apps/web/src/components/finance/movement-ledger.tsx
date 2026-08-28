import {
  EXPENSE_CATEGORY_LABELS,
  gnvBarTone,
  GNV_BAR_LABELS,
  PAYMENT_METHOD_LABELS,
  type ExpenseCategory,
  type GnvBar,
} from "@life-manager/shared/finance/constants";
import { formatSoles } from "@life-manager/shared/finance/constants";
import { formatTimeLima, type MovementRow } from "@life-manager/shared/finance/summaries";

type Props = {
  rows: MovementRow[];
  showGnvBar?: boolean;
  emptyMessage?: string;
};

export function MovementLedger({
  rows,
  showGnvBar = false,
  emptyMessage = "Sin movimientos.",
}: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-line/80 text-left text-muted">
            <th className="pb-2 pr-3 font-medium">Hora</th>
            <th className="pb-2 pr-3 font-medium">Concepto</th>
            {showGnvBar ? <th className="pb-2 pr-3 font-medium">GNV</th> : null}
            <th className="pb-2 pr-3 font-medium">Pago</th>
            <th className="pb-2 text-right font-medium">Monto</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line/40 last:border-0">
              <td className="py-2.5 pr-3 text-muted whitespace-nowrap">
                {formatTimeLima(row.occurred_at)}
              </td>
              <td className="py-2.5 pr-3 text-ink">
                <span className={row.direction === "in" ? "text-forest" : "text-ink"}>
                  {row.direction === "in" ? "+" : "−"}
                </span>{" "}
                {row.label}
                {row.category ? (
                  <span className="ml-1 text-xs text-muted">
                    · {EXPENSE_CATEGORY_LABELS[row.category as ExpenseCategory] ?? row.category}
                  </span>
                ) : null}
              </td>
              {showGnvBar ? (
                <td className="py-2.5 pr-3">
                  {row.gnv_bar != null ? (
                    <GnvBarBadge bar={row.gnv_bar as GnvBar} />
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              ) : null}
              <td className="py-2.5 pr-3 text-muted whitespace-nowrap">
                {row.payment_method
                  ? PAYMENT_METHOD_LABELS[row.payment_method]
                  : "—"}
              </td>
              <td
                className={`py-2.5 text-right font-semibold whitespace-nowrap ${
                  row.direction === "in" ? "text-forest" : "text-ink"
                }`}
              >
                {formatSoles(Number(row.amount_soles))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GnvBarBadge({ bar }: { bar: GnvBar }) {
  const tone = gnvBarTone(bar);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        tone === "red"
          ? "bg-red-50 text-red-800"
          : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {GNV_BAR_LABELS[bar]}
    </span>
  );
}
