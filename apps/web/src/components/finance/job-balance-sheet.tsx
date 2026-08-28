import type { PaymentMethod } from "@life-manager/shared/finance/constants";

export type SheetIncomeItem = {
  amount: number;
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

function formatDateLabel(dateYmd: string): string {
  const date = new Date(`${dateYmd}T12:00:00-05:00`);
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

type Props = {
  workDate: string;
  totalIncome: number;
  totalExpense: number;
  jobs: SheetJobGroup[];
  expenses: SheetExpenseItem[];
  balanceLabel?: string;
  singleJobLabel?: string;
};

export function JobBalanceSheet({
  workDate,
  totalIncome,
  totalExpense,
  jobs,
  expenses,
  balanceLabel = "BALANCE",
  singleJobLabel,
}: Props) {
  const balance = totalIncome - totalExpense;
  const cell = "border border-ink/80 bg-panel px-2 py-1.5";

  type LeftRow =
    | { kind: "summary"; jobLabel?: string; paymentLine: string }
    | { kind: "amount"; amount: string };

  const leftRows: LeftRow[] = [];

  for (const job of jobs) {
    leftRows.push({
      kind: "summary",
      jobLabel: singleJobLabel ? undefined : job.jobLabel,
      paymentLine: `Yape ${formatCellAmount(job.byPayment.yape)} · Plin ${formatCellAmount(job.byPayment.plin)} · Efectivo ${formatCellAmount(job.byPayment.efectivo)}`,
    });
    for (const income of job.incomes) {
      leftRows.push({ kind: "amount", amount: formatCellAmount(income.amount) });
    }
  }

  const rowCount = Math.max(leftRows.length, expenses.length, 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] border-collapse border border-ink/80 text-sm">
        <thead>
          <tr>
            <th className={`${cell} text-left font-semibold`}>FECHA</th>
            <th className={`${cell} text-left font-semibold`}>INGRESOS</th>
            <th className={`${cell} text-left font-semibold`}>EGRESOS</th>
            <th className={`${cell} text-left font-semibold`}>{balanceLabel}</th>
          </tr>
          <tr>
            <th className={`${cell} text-left font-normal capitalize`}>{formatDateLabel(workDate)}</th>
            <th className={`${cell} text-left font-normal tabular-nums`}>{formatCellAmount(totalIncome)}</th>
            <th className={`${cell} text-left font-normal tabular-nums`}>{formatCellAmount(totalExpense)}</th>
            <th className={`${cell} text-left font-normal tabular-nums`}>{formatCellAmount(balance)}</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, index) => {
            const left = leftRows[index];
            const expense = expenses[index];

            return (
              <tr key={index}>
                {singleJobLabel ? (
                  index === 0 ? (
                    <td rowSpan={rowCount} className={`${cell} align-middle font-semibold uppercase`}>
                      {singleJobLabel}
                    </td>
                  ) : null
                ) : (
                  <td className={`${cell} align-top font-semibold uppercase`}>
                    {left?.kind === "summary" && left.jobLabel ? left.jobLabel : ""}
                  </td>
                )}
                <td className={`${cell} text-right tabular-nums align-top`}>
                  {left?.kind === "summary" ? (
                    <span className="block text-left text-xs font-normal normal-case text-muted">
                      {left.paymentLine}
                    </span>
                  ) : null}
                  {left?.kind === "amount" ? left.amount : ""}
                </td>
                <td className={`${cell} align-top`}>{expense?.label ?? ""}</td>
                <td className={`${cell} text-right tabular-nums align-top`}>
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
    group.incomes.push({ amount, payment_method: row.payment_method });

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
