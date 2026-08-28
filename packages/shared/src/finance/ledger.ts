import type { PaymentMethod } from "./constants";

export type LedgerMovement = {
  id: string;
  direction: "in" | "out";
  amount_soles: number;
  label: string;
  source: string;
  category: string | null;
  job_id: string | null;
  jobs?: { code: string } | { code: string }[] | null;
};

export function jobCodeToLabel(code: string | null | undefined, source: string): string {
  if (code === "DRIVER") return "taxi";
  if (code === "TRAINER") return "trainer";
  if (code === "BOTANICO") return "botánico";
  if (code === "NATURISTA") return "botánico";
  if (code === "DEVELOPER") return "desarrollador";
  if (code === "TRAINEE") return "trainee";
  if (code === "PLAYER") return "player";
  if (source === "opening_balance") return "apertura";
  return code?.toLowerCase() ?? source;
}

export function resolveJobCode(row: LedgerMovement): string {
  const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
  return job?.code ?? (row.source === "driver_income" || row.source === "driver_expense" ? "DRIVER" : "other");
}

export function isPersonalFinanceExpense(row: LedgerMovement): boolean {
  if (row.direction !== "out") return false;
  if (row.source === "driver_expense") return false;
  if (row.job_id != null) return false;
  return row.source === "expense" || row.source === "food";
}

/** @deprecated Usar isPersonalFinanceExpense */
export function isFoodExpense(row: LedgerMovement): boolean {
  return isPersonalFinanceExpense(row);
}

export function sumPersonalDayExpenses(expenses: LedgerMovement[]): number {
  return expenses
    .filter(isPersonalFinanceExpense)
    .reduce((t, row) => t + Number(row.amount_soles), 0);
}

/** @deprecated Usar sumPersonalDayExpenses */
export function sumFoodExpenses(expenses: LedgerMovement[]): number {
  return sumPersonalDayExpenses(expenses);
}

export function isDriverJobExpense(row: LedgerMovement, driverJobId: string | null): boolean {
  if (row.direction !== "out") return false;
  if (row.source === "driver_expense") return true;
  return driverJobId != null && row.job_id === driverJobId && row.source === "expense";
}

/** Gasto ligado a un job (taxi, botánico, etc.) */
export function isJobLinkedExpense(row: LedgerMovement): boolean {
  if (row.direction !== "out" || row.job_id == null) return false;
  return row.source === "driver_expense" || row.source === "expense";
}

export function incomeDescriptionForFinance(row: LedgerMovement): string {
  const code = resolveJobCode(row);
  if (code === "DRIVER") return "taxi";
  return jobCodeToLabel(code, row.source);
}

export function computeNetBalance(movements: LedgerMovement[]): number {
  return movements.reduce((total, row) => {
    const amount = Number(row.amount_soles);
    return row.direction === "in" ? total + amount : total - amount;
  }, 0);
}

export type JobDayIncome = {
  jobCode: string;
  label: string;
  gross: number;
  jobExpenses: number;
  net: number;
  isTaxi: boolean;
};

export function summarizeDayIncomeByJob(
  incomes: LedgerMovement[],
  expenses: LedgerMovement[],
  driverJobId: string | null,
): JobDayIncome[] {
  const map = new Map<string, { jobCode: string; gross: number; jobExpenses: number }>();

  for (const row of incomes) {
    const jobCode = resolveJobCode(row);
    const key = row.job_id ?? jobCode;
    const current = map.get(key) ?? { jobCode, gross: 0, jobExpenses: 0 };
    current.gross += Number(row.amount_soles);
    map.set(key, current);
  }

  for (const row of expenses) {
    if (!isJobLinkedExpense(row)) continue;
    const jobCode = resolveJobCode(row);
    const key = row.job_id ?? jobCode;
    const current = map.get(key) ?? { jobCode, gross: 0, jobExpenses: 0 };
    current.jobExpenses += Number(row.amount_soles);
    map.set(key, current);
  }

  return [...map.values()]
    .filter((row) => row.gross > 0 || row.jobExpenses > 0)
    .map((row) => ({
      jobCode: row.jobCode,
      label: jobCodeToLabel(row.jobCode, "income"),
      gross: row.gross,
      jobExpenses: row.jobExpenses,
      net: row.gross - row.jobExpenses,
      isTaxi: row.jobCode === "DRIVER",
    }));
}

export type SheetExpenseRow = {
  id: string;
  label: string;
  amount: number;
  category: string | null;
  editableCategory: boolean;
};

export function buildFinanceExpenseRows(expenses: LedgerMovement[]): SheetExpenseRow[] {
  return expenses.map((row) => ({
    id: row.id,
    label: row.label,
    amount: Number(row.amount_soles),
    category: row.category,
    editableCategory: isPersonalFinanceExpense(row),
  }));
}

export type SheetIncomeRow = {
  id: string;
  description: string;
  editLabel: string;
  amount: number;
};

export function buildFinanceIncomeRows(incomes: LedgerMovement[]): SheetIncomeRow[] {
  return incomes.map((row) => ({
    id: row.id,
    description: incomeDescriptionForFinance(row),
    editLabel: row.label?.trim() || incomeDescriptionForFinance(row),
    amount: Number(row.amount_soles),
  }));
}

export type AccountBalanceSnapshot = {
  payment_account_id: string;
  balance_date: string;
  balance_soles: number;
};

/** Última asignación en o antes de `asOfDate`. Nunca usa fechas posteriores. */
export function resolveAccountSnapshotsAsOf(
  snapshots: AccountBalanceSnapshot[],
  asOfDate: string,
): Map<string, number> {
  const latest = new Map<string, { date: string; amount: number }>();
  for (const row of snapshots) {
    if (row.balance_date > asOfDate) continue;
    const amount = Number(row.balance_soles);
    const prev = latest.get(row.payment_account_id);
    if (!prev || row.balance_date >= prev.date) {
      latest.set(row.payment_account_id, { date: row.balance_date, amount });
    }
  }
  return new Map([...latest.entries()].map(([id, v]) => [id, v.amount]));
}

export type PaymentAccountAllocation = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  allocated_soles: number;
};

export function mergeAccountAllocations(
  accounts: PaymentAccountAllocation[],
  totalNet: number,
): PaymentAccountAllocation[] {
  const active = accounts.filter((a) => a.is_active);
  const nonCash = active.filter((a) => a.slug !== "efectivo");
  const cash = active.find((a) => a.slug === "efectivo");
  const allocatedNonCash = nonCash.reduce((s, a) => s + a.allocated_soles, 0);
  const cashAmount = Math.max(0, Math.round((totalNet - allocatedNonCash) * 100) / 100);

  return active.map((account) =>
    account.slug === "efectivo"
      ? { ...account, allocated_soles: cashAmount }
      : account,
  );
}

export { type PaymentMethod };
