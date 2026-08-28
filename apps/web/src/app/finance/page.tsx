import { AppHeader } from "@/components/layout/app-header";
import { FinanceForms } from "@/components/finance/finance-forms";
import {
  buildExpenseItems,
  buildJobGroups,
  JobBalanceSheet,
} from "@/components/finance/job-balance-sheet";
import { PaymentAccountsSettings } from "@/components/finance/payment-accounts-settings";
import { WalletBalances } from "@/components/finance/wallet-balances";
import { DayPicker } from "@/components/driver/day-picker";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import {
  dayRangeInLima,
  todayInLima,
} from "@life-manager/shared/finance/summaries";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function FinancePage({ searchParams }: PageProps) {
  const { date: dateParam } = await searchParams;
  const workDate = dateParam ?? todayInLima();
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

  const rows = movements ?? [];
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

  const activeAccounts = accounts.filter((row) => row.is_active);

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader showPlayerMenu showFinanceMenu showNutritionMenu />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <DayPicker value={workDate} />

        <div className="mt-4 space-y-4">
          <WalletBalances accounts={accounts} />
          <PaymentAccountsSettings accounts={accounts} />
        </div>

        <div className="mt-6">
          <JobBalanceSheet
            totalIncome={income}
            totalExpense={expenses}
            jobs={buildJobGroups(incomeRows)}
            expenses={buildExpenseItems(expenseRows)}
          />
        </div>

        <Link href="/home" className="mt-4 inline-block text-sm font-medium text-teal">
          ← Hub
        </Link>

        <div className="mt-6">
          <FinanceForms workDate={workDate} paymentAccounts={activeAccounts} />
        </div>
      </div>
    </main>
  );
}
