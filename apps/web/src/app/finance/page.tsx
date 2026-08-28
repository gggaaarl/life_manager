import { AppHeader } from "@/components/layout/app-header";
import { DayFoodExpensesSummary } from "@/components/finance/day-food-expenses-summary";
import { DayIncomeSummary } from "@/components/finance/day-income-summary";
import { FinanceForms } from "@/components/finance/finance-forms";
import { FinanceLedgerTable } from "@/components/finance/finance-ledger-table";
import { WalletBalancesEditor } from "@/components/finance/wallet-balances-editor";
import { sortPaymentAccountsForDisplay } from "@/components/finance/sort-payment-accounts";
import { DayPicker } from "@/components/driver/day-picker";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import {
  buildFinanceExpenseRows,
  buildFinanceIncomeRows,
  computeNetBalance,
  summarizeDayIncomeByJob,
  sumPersonalDayExpenses,
  type LedgerMovement,
} from "@life-manager/shared/finance/ledger";
import { dayRangeInLima } from "@life-manager/shared/finance/summaries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const DEFAULT_FINANCE_DATE = "2026-08-22";

const MOVEMENT_SELECT =
  "id, occurred_at, direction, amount_soles, label, payment_method, source, category, job_id, jobs(code)";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

function asLedgerRows(rows: unknown[]): LedgerMovement[] {
  return (rows ?? []) as LedgerMovement[];
}

export default async function FinancePage({ searchParams }: PageProps) {
  const { date: dateParam } = await searchParams;
  const workDate = dateParam ?? DEFAULT_FINANCE_DATE;
  const { start, end } = dayRangeInLima(workDate);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const accessProfile = await getProfileAccess(supabase, user.id);
  const showPlayerMenu = canAccessPlayerMenu(accessProfile, user.id);

  const [
    { data: dayMovements },
    { data: cumulativeMovements },
    { data: paymentAccounts },
    { data: driverJob },
    { data: expenseItems },
  ] = await Promise.all([
    supabase
      .from("finance_movements")
      .select(MOVEMENT_SELECT)
      .eq("user_id", user.id)
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .order("occurred_at", { ascending: true }),
    supabase
      .from("finance_movements")
      .select(MOVEMENT_SELECT)
      .eq("user_id", user.id)
      .lt("occurred_at", end)
      .neq("source", "opening_balance")
      .order("occurred_at", { ascending: true }),
    supabase
      .from("user_payment_accounts")
      .select("id, slug, label, sort_order, is_active, user_account_balances(balance_soles)")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase.from("jobs").select("id").eq("code", "DRIVER").maybeSingle(),
    supabase
      .from("expense_items")
      .select("id, name, brand, default_category, default_price_soles, user_id")
      .eq("is_active", true)
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("name"),
  ]);

  const dayRows = asLedgerRows(dayMovements ?? []).filter((row) => row.source !== "opening_balance");
  const cumulativeRows = asLedgerRows(cumulativeMovements ?? []);
  const incomeRows = dayRows.filter((row) => row.direction === "in");
  const expenseRows = dayRows.filter((row) => row.direction === "out");

  const driverJobId = driverJob?.id ?? null;
  const jobIncomes = summarizeDayIncomeByJob(incomeRows, expenseRows, driverJobId);
  const personalExpenseTotal = sumPersonalDayExpenses(expenseRows);
  const totalNet = computeNetBalance(cumulativeRows);

  const accounts = (paymentAccounts ?? []).map((row) => {
    const balanceRow = Array.isArray(row.user_account_balances)
      ? row.user_account_balances[0]
      : row.user_account_balances;
    return {
      id: row.id,
      slug: row.slug,
      label: row.label,
      sort_order: row.sort_order,
      is_active: row.is_active,
      allocated_soles: Number(balanceRow?.balance_soles ?? 0),
    };
  });

  const activeAccounts = sortPaymentAccountsForDisplay(
    accounts.map((a) => ({
      id: a.id,
      slug: a.slug,
      label: a.label,
      sort_order: a.sort_order,
      is_active: a.is_active,
      balance_soles: a.allocated_soles,
    })),
  ).map(({ id, label }) => ({ id, label }));

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader showPlayerMenu showFinanceMenu showNutritionMenu />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <DayPicker value={workDate} />

        <div className="mt-4">
          <WalletBalancesEditor workDate={workDate} totalNet={totalNet} accounts={accounts} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DayIncomeSummary jobs={jobIncomes} />
          <DayFoodExpensesSummary total={personalExpenseTotal} />
        </div>

        <div className="mt-6">
          <FinanceLedgerTable
            incomes={buildFinanceIncomeRows(incomeRows)}
            expenses={buildFinanceExpenseRows(expenseRows)}
          />
        </div>

        <div className="mt-6">
          <FinanceForms
            workDate={workDate}
            paymentAccounts={activeAccounts}
            expenseItems={(expenseItems ?? []).map((row) => ({
              id: row.id,
              name: row.name,
              brand: row.brand,
              default_category: row.default_category,
              default_price_soles: Number(row.default_price_soles),
              user_id: row.user_id,
            }))}
          />
        </div>
      </div>
    </main>
  );
}
