import { AppHeader } from "@/components/layout/app-header";
import { DayPicker } from "@/components/driver/day-picker";
import { DriverForms } from "@/components/driver/driver-forms";
import {
  DriverShiftForms,
  ShiftSummaryCard,
} from "@/components/driver/driver-shift-forms";
import { MovementLedger } from "@/components/finance/movement-ledger";
import { WalletBalances } from "@/components/finance/wallet-balances";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import {
  formatSoles,
  GNV_BAR_LABELS,
  gnvBarTone,
  PAYMENT_METHOD_LABELS,
} from "@life-manager/shared/finance/constants";
import {
  dayRangeInLima,
  formatDuration,
  hourlyRate,
  movementsForShift,
  shiftWorkedMinutes,
  sumByGnvBar,
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

export default async function DriverPage({ searchParams }: PageProps) {
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

  const [{ data: movements }, { data: wallets }, { data: shifts }] =
    await Promise.all([
      supabase
        .from("finance_movements")
        .select(
          "id, occurred_at, direction, amount_soles, kcal, label, payment_method, source, category, gnv_bar, driver_shift_id",
        )
        .eq("user_id", user.id)
        .eq("job_id", driverJob?.id ?? "")
        .gte("occurred_at", start)
        .lt("occurred_at", end)
        .order("occurred_at", { ascending: false }),
      supabase
        .from("user_wallet_balances")
        .select("payment_method, balance_soles")
        .eq("user_id", user.id),
      supabase
        .from("driver_shifts")
        .select("id, shift_number, started_at, ended_at, break_minutes, notes")
        .eq("user_id", user.id)
        .eq("work_date", workDate)
        .order("shift_number", { ascending: true }),
    ]);

  const rows = movements ?? [];
  const shiftRows = shifts ?? [];
  const income = sumIncomeToday(rows);
  const expenses = sumExpensesToday(rows);
  const net = income - expenses;
  const byPayment = sumIncomeByPayment(rows);
  const byBar = sumByGnvBar(rows);
  const totalWorkedMinutes = shiftRows.reduce(
    (total, shift) => total + shiftWorkedMinutes(shift),
    0,
  );
  const rate = hourlyRate(net, totalWorkedMinutes);

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader showPlayerMenu showFinanceMenu showNutritionMenu showDriverMenu />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link href="/home" className="text-sm font-medium text-teal">
          ← Hub
        </Link>
        <div className="mt-3 mb-6">
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-teal">
            DRIVER
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-ink">
            Chofer
          </h1>
          <p className="mt-1 text-sm text-muted">
            Control por vueltas, horas y barras GNV. Todo se refleja en Finanzas.
          </p>
        </div>

        <div className="mb-6">
          <DayPicker value={workDate} />
        </div>

        <div className="mb-6">
          <WalletBalances wallets={wallets ?? []} />
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Ingresos del día" value={formatSoles(income)} tone="forest" />
          <Stat label="Gastos del día" value={formatSoles(expenses)} />
          <Stat label="Líquido del día" value={formatSoles(net)} tone={net >= 0 ? "forest" : "danger"} />
          <Stat
            label="Horas netas"
            value={
              totalWorkedMinutes > 0
                ? `${formatDuration(totalWorkedMinutes)}${rate != null ? ` · S/ ${rate}/h` : ""}`
                : "—"
            }
          />
        </div>

        {shiftRows.length > 0 ? (
          <section className="mb-6 grid gap-4 sm:grid-cols-2">
            {shiftRows.map((shift) => {
              const shiftMovements = movementsForShift(rows, shift.id);
              const shiftIncome = sumIncomeToday(shiftMovements);
              const shiftExpenses = sumExpensesToday(shiftMovements);
              return (
                <ShiftSummaryCard
                  key={shift.id}
                  shift={shift}
                  income={shiftIncome}
                  expenses={shiftExpenses}
                  workedMinutes={shiftWorkedMinutes(shift)}
                />
              );
            })}
          </section>
        ) : null}

        <div className="mb-6 rounded-2xl bg-panel p-5 border border-line/60">
          <p className="mb-3 font-medium text-ink">Ingresos por barra GNV</p>
          <div className="grid gap-2 sm:grid-cols-5">
            {([5, 4, 3, 2, 1] as const).map((bar) => (
              <div
                key={bar}
                className={`rounded-xl px-3 py-2 text-sm ${
                  gnvBarTone(bar) === "red" ? "bg-red-950/50" : "bg-emerald-950/50"
                }`}
              >
                <p className="text-muted">{GNV_BAR_LABELS[bar]}</p>
                <p className="font-semibold text-ink">{formatSoles(byBar[bar])}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-panel p-5 border border-line/60">
          <p className="mb-3 font-medium text-ink">Carreras por método</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(["yape", "plin", "efectivo"] as const).map((method) => (
              <div key={method} className="rounded-xl bg-sand/50 px-3 py-2 text-sm">
                <p className="text-muted">{PAYMENT_METHOD_LABELS[method]}</p>
                <p className="font-semibold text-ink">{formatSoles(byPayment[method])}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mb-6 rounded-2xl bg-panel p-5 border border-line/60">
          <p className="mb-3 font-medium text-ink">Vueltas del día</p>
          <DriverShiftForms workDate={workDate} shifts={shiftRows} />
        </section>

        <DriverForms workDate={workDate} shifts={shiftRows} />

        <section className="mt-6 rounded-2xl bg-panel p-5 border border-line/60">
          <p className="mb-3 font-medium text-ink">Detalle del día — ingresos y gastos</p>
          <MovementLedger rows={rows} showGnvBar emptyMessage="Sin movimientos chofer este día." />
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "forest" | "danger";
}) {
  return (
    <div className="rounded-2xl bg-panel p-5 border border-line/60">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-1 font-[family-name:var(--font-display)] text-2xl font-bold ${
          tone === "forest"
            ? "text-forest"
            : tone === "danger"
              ? "text-[var(--lm-danger)]"
              : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
