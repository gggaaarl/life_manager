import { AppHeader } from "@/components/layout/app-header";
import { FinanceForms } from "@/components/finance/finance-forms";
import { MovementLedger } from "@/components/finance/movement-ledger";
import { OpeningBalanceForm } from "@/components/finance/opening-balance-form";
import { WalletBalances } from "@/components/finance/wallet-balances";
import { DayPicker } from "@/components/driver/day-picker";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import {
  formatSoles,
  PAYMENT_METHOD_LABELS,
} from "@life-manager/shared/finance/constants";
import {
  dayRangeInLima,
  sumExpensesToday,
  sumIncomeByPayment,
  sumIncomeToday,
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

  const { data: movements } = await supabase
    .from("finance_movements")
    .select(
      "id, occurred_at, direction, amount_soles, kcal, label, payment_method, source, category, gnv_bar",
    )
    .eq("user_id", user.id)
    .gte("occurred_at", start)
    .lt("occurred_at", end)
    .order("occurred_at", { ascending: false });

  const { data: wallets } = await supabase
    .from("user_wallet_balances")
    .select("payment_method, balance_soles")
    .eq("user_id", user.id);

  const { count: openingCount } = await supabase
    .from("finance_movements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", "opening_balance");

  const rows = movements ?? [];
  const expenses = sumExpensesToday(rows);
  const income = sumIncomeToday(rows);
  const byPayment = sumIncomeByPayment(rows);

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader showPlayerMenu showFinanceMenu showNutritionMenu />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <StatCard label="Ingresos" value={formatSoles(income)} tone="forest" />
          <StatCard label="Gastos" value={formatSoles(expenses)} />
        </div>
        <div className="mb-6">
          <StatCard label="Balance" value={formatSoles(income - expenses)} />
        </div>

        <Link href="/home" className="text-sm font-medium text-teal">
          ← Hub
        </Link>
        <div className="mt-3 mb-6">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-ink">
            Finanzas
          </h1>
        </div>

        <div className="mb-6">
          <DayPicker value={workDate} />
        </div>

        <div className="mb-6 space-y-4">
          <WalletBalances wallets={wallets ?? []} />
          <OpeningBalanceForm hasOpeningBalance={(openingCount ?? 0) > 0} />
        </div>

        <div className="mb-6 rounded-2xl bg-panel p-5 border border-line/60">
          <p className="mb-3 font-medium text-ink">Ingresos por método</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(["yape", "plin", "efectivo"] as const).map((method) => (
              <div key={method} className="rounded-xl bg-sand px-3 py-2 text-sm">
                <p className="text-muted">{PAYMENT_METHOD_LABELS[method]}</p>
                <p className="font-semibold text-ink">{formatSoles(byPayment[method])}</p>
              </div>
            ))}
          </div>
        </div>

        <FinanceForms workDate={workDate} />

        <section className="mt-6 rounded-2xl bg-panel p-5 border border-line/60">
          <p className="mb-3 font-medium text-ink">Movimientos del día</p>
          <MovementLedger rows={rows} showGnvBar emptyMessage="Sin movimientos este día." />
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "forest";
}) {
  return (
    <div className="rounded-2xl bg-panel p-5 border border-line/60">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-1 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl ${
          tone === "forest" ? "text-forest" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
