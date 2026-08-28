import type { PaymentMethod } from "@life-manager/shared/finance/constants";

export type SheetIncomeItem = {
  amount: number;
  description: string;
  payment_method: PaymentMethod | null;
};

export type SheetExpenseItem = {
  label: string;
  amount: number;
};

export type SheetJobGroup = {
  jobLabel: string;
  byPayment: Record<"yape" | "plin" | "efectivo", number>;
  incomes: SheetIncomeItem[];
};

function formatCellAmount(amount: number): string {
  return amount.toFixed(1).replace(".", ",");
}

type Props = {
  jobs: SheetJobGroup[];
  expenses: SheetExpenseItem[];
  amountColumnLabel?: string;
  singleJobLabel?: string;
};

export function JobBalanceSheet({
  jobs,
  expenses,
  amountColumnLabel = "Balance",
  singleJobLabel,
}: Props) {
  type LeftRow =
    | { kind: "summary"; description: string; paymentLine: string }
    | { kind: "amount"; description: string; amount: string };

  const leftRows: LeftRow[] = [];

  for (const job of jobs) {
    leftRows.push({
      kind: "summary",
      description: singleJobLabel ?? job.jobLabel,
      paymentLine: `Yape ${formatCellAmount(job.byPayment.yape)} · Plin ${formatCellAmount(job.byPayment.plin)} · Efectivo ${formatCellAmount(job.byPayment.efectivo)}`,
    });
    for (const income of job.incomes) {
      leftRows.push({
        kind: "amount",
        description: income.description,
        amount: formatCellAmount(income.amount),
      });
    }
  }

  const rowCount = Math.max(leftRows.length, expenses.length, 1);
  const th = "border border-line bg-teal/10 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink";
  const td = "border border-line bg-panel px-3 py-2 text-sm";

  return (
    <div className="overflow-x-auto rounded-xl border border-line shadow-sm">
      <table className="w-full min-w-[320px] border-collapse text-sm">
        <thead>
          <tr>
            <th className={th}>Descripción</th>
            <th className={th}>Ingresos</th>
            <th className={th}>Egresos</th>
            <th className={th}>{amountColumnLabel}</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, index) => {
            const left = leftRows[index];
            const expense = expenses[index];

            return (
              <tr key={index} className="even:bg-sand/30">
                <td className={`${td} align-top`}>
                  {left?.description ?? expense?.label ?? ""}
                </td>
                <td className={`${td} text-right tabular-nums align-top`}>
                  {left?.kind === "summary" ? (
                    <span className="mb-1 block text-left text-xs font-normal text-muted">
                      {left.paymentLine}
                    </span>
                  ) : null}
                  {left?.kind === "amount" ? left.amount : ""}
                </td>
                <td className={`${td} align-top`}>{expense?.label ?? ""}</td>
                <td className={`${td} text-right tabular-nums align-top`}>
                  {expense ? formatCellAmount(expense.amount) : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function jobCodeToSheetLabel(code: string | null | undefined, source: string): string {
  if (code === "DRIVER") return "taxi";
  if (code === "TRAINER") return "trainer";
  if (code === "NATURISTA") return "naturista";
  if (code === "TRAINEE") return "trainee";
  if (code === "PLAYER") return "player";
  if (source === "opening_balance") return "apertura";
  return source;
}

export function buildJobGroups(
  incomes: {
    amount_soles: number;
    payment_method: PaymentMethod | null;
    job_id: string | null;
    source: string;
    jobs?: { code: string } | { code: string }[] | null;
  }[],
): SheetJobGroup[] {
  const groups = new Map<string, SheetJobGroup>();

  for (const row of incomes) {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    const label = jobCodeToSheetLabel(job?.code, row.source);
    const key = row.job_id ?? label;

    if (!groups.has(key)) {
      groups.set(key, {
        jobLabel: label,
        byPayment: { yape: 0, plin: 0, efectivo: 0 },
        incomes: [],
      });
    }

    const group = groups.get(key)!;
    const amount = Number(row.amount_soles);
    group.incomes.push({ amount, description: label, payment_method: row.payment_method });

    if (row.payment_method === "yape") group.byPayment.yape += amount;
    if (row.payment_method === "plin") group.byPayment.plin += amount;
    if (row.payment_method === "efectivo") group.byPayment.efectivo += amount;
  }

  return [...groups.values()];
}

export function buildExpenseItems(
  expenses: { label: string; amount_soles: number }[],
): SheetExpenseItem[] {
  return expenses.map((row) => ({
    label: row.label,
    amount: Number(row.amount_soles),
  }));
}
