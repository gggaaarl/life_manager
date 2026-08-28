import type { PaymentMethod } from "@life-manager/shared/finance/constants";

export type SheetIncomeRow = {
  description: string;
  amount: number;
};

export type SheetExpenseItem = {
  label: string;
  amount: number;
};

function formatCellAmount(amount: number): string {
  return amount.toFixed(1).replace(".", ",");
}

type Props = {
  incomes: SheetIncomeRow[];
  expenses: SheetExpenseItem[];
  totalExpense: number;
};

export function JobBalanceSheet({ incomes, expenses, totalExpense }: Props) {
  const rowCount = Math.max(incomes.length, expenses.length, 1);
  const th = "border border-line bg-teal/10 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink";
  const td = "border border-line bg-panel px-3 py-2 text-sm";

  return (
    <div className="overflow-x-auto rounded-xl border border-line shadow-sm">
      <table className="w-full min-w-[280px] border-collapse text-sm">
        <thead>
          <tr>
            <th className={th}>Descripción</th>
            <th className={th}>Ingresos</th>
            <th className={`${th} text-right`}>
              <span className="block text-sm font-bold normal-case tabular-nums text-ink">
                {formatCellAmount(totalExpense)}
              </span>
              <span>Egresos</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, index) => {
            const income = incomes[index];
            const expense = expenses[index];

            return (
              <tr key={index} className="even:bg-sand/30">
                <td className={`${td} align-top`}>
                  {income?.description ?? expense?.label ?? ""}
                </td>
                <td className={`${td} text-right tabular-nums align-top`}>
                  {income ? formatCellAmount(income.amount) : ""}
                </td>
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

export function buildIncomeRows(
  rows: {
    amount_soles: number;
    label: string;
    payment_method: PaymentMethod | null;
    job_id: string | null;
    source: string;
    jobs?: { code: string } | { code: string }[] | null;
  }[],
): SheetIncomeRow[] {
  return rows.map((row) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    const jobLabel = jobCodeToSheetLabel(job?.code, row.source);
    return {
      description: row.label?.trim() || jobLabel,
      amount: Number(row.amount_soles),
    };
  });
}

export function buildExpenseItems(
  expenses: { label: string; amount_soles: number }[],
): SheetExpenseItem[] {
  return expenses.map((row) => ({
    label: row.label,
    amount: Number(row.amount_soles),
  }));
}
