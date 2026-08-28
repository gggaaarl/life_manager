import { AppHeader } from "@/components/layout/app-header";
import { DayBalanceCard } from "@/components/finance/day-balance-card";
import { FinanceForms } from "@/components/finance/finance-forms";
import {
  buildExpenseItems,
  buildIncomeRows,
  JobBalanceSheet,
} from "@/components/finance/job-balance-sheet";
import { WalletBalances } from "@/components/finance/wallet-balances";
import { sortPaymentAccountsForDisplay } from "@/components/finance/sort-payment-accounts";
import { DayPicker } from "@/components/driver/day-picker";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import { dayRangeInLima } from "@life-manager/shared/finance/summaries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** Día con data histórica cargada (sáb 22-ago-2026). */
const DEFAULT_FINANCE_DATE = "2026-08-22";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

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

  const [{ data: movements }, { data: paymentAccounts }] = await Promise.all([
    supabase
      .from("finance_movements")
      .select(
        "id, occurred_at, direction, amount_soles, label, payment_method, source, job_id, jobs(code)",
      )
      .eq("user_id", user.id)
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .order("occurred_at", { ascending: true }),
    supabase
      .from("user_payment_accounts")
      .select("id, slug, label, sort_order, is_active, user_account_balances(balance_soles)")
      .eq("user_id", user.id)
      .order("sort_order"),
  ]);

  const rows = (movements ?? []).filter((row) => row.source !== "opening_balance");
  const incomeRows = rows.filter((row) => row.direction === "in");
  const expenseRows = rows.filter((row) => row.direction === "out");
  const income = incomeRows.reduce((t, r) => t + Number(r.amount_soles), 0);
  const expenses = expenseRows.reduce((t, r) => t + Number(r.amount_soles), 0);

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
      balance_soles: Number(balanceRow?.balance_soles ?? 0),
    };
  });

  const activeAccounts = sortPaymentAccountsForDisplay(accounts);

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader showPlayerMenu showFinanceMenu showNutritionMenu />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <DayPicker value={workDate} />

        <div className="mt-4 space-y-4">
          <WalletBalances accounts={accounts} />
          <DayBalanceCard totalIncome={income} totalExpense={expenses} />
        </div>

        <div className="mt-6">
          <JobBalanceSheet
            incomes={buildIncomeRows(incomeRows)}
            expenses={buildExpenseItems(expenseRows)}
            totalExpense={expenses}
          />
        </div>

        <div className="mt-6">
          <FinanceForms workDate={workDate} paymentAccounts={activeAccounts} />
        </div>
      </div>
    </main>
  );
}
