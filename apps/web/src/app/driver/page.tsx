import { AppHeader } from "@/components/layout/app-header";
import { DayPicker } from "@/components/driver/day-picker";
import { DayBalanceCard } from "@/components/finance/day-balance-card";
import { DriverForms } from "@/components/driver/driver-forms";
import {
  buildExpenseItems,
  buildIncomeRows,
  JobBalanceSheet,
} from "@/components/finance/job-balance-sheet";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import { dayRangeInLima } from "@life-manager/shared/finance/summaries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const DEFAULT_DRIVER_DATE = "2026-08-22";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DriverPage({ searchParams }: PageProps) {
  const { date: dateParam } = await searchParams;
  const workDate = dateParam ?? DEFAULT_DRIVER_DATE;
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

  const { data: driverJob } = await supabase
    .from("jobs")
    .select("id")
    .eq("code", "DRIVER")
    .single();

  const { data: userJob } = driverJob
    ? await supabase
        .from("user_jobs")
        .select("status")
        .eq("user_id", user.id)
        .eq("job_id", driverJob.id)
        .maybeSingle()
    : { data: null };

  const canUseDriver =
    userJob?.status === "active" || userJob?.status === "unlocked";

  if (!canUseDriver) {
    redirect("/home");
  }

  const [{ data: movements }] = await Promise.all([
    supabase
      .from("finance_movements")
      .select(
        "id, occurred_at, direction, amount_soles, label, payment_method, source, job_id, jobs(code)",
      )
      .eq("user_id", user.id)
      .eq("job_id", driverJob?.id ?? "")
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .order("occurred_at", { ascending: true }),
  ]);

  const rows = movements ?? [];
  const incomeRows = rows.filter((row) => row.direction === "in");
  const expenseRows = rows.filter((row) => row.direction === "out");
  const income = incomeRows.reduce((t, r) => t + Number(r.amount_soles), 0);
  const expenses = expenseRows.reduce((t, r) => t + Number(r.amount_soles), 0);

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader showPlayerMenu showFinanceMenu showNutritionMenu showDriverMenu />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <DayPicker value={workDate} />

        <div className="mt-4">
          <DayBalanceCard
            totalIncome={income}
            totalExpense={expenses}
            title="Ganancia del día"
          />
        </div>

        <div className="mt-6">
          <JobBalanceSheet
            incomes={buildIncomeRows(incomeRows)}
            expenses={buildExpenseItems(expenseRows)}
          />
        </div>

        <div className="mt-6">
          <DriverForms />
        </div>
      </div>
    </main>
  );
}
