import { AppHeader } from "@/components/layout/app-header";
import { FoodLogForm } from "@/components/trainee/food-log-form";
import { WalletBalances } from "@/components/finance/wallet-balances";
import { getUserNavJobs } from "@/lib/nav/get-user-nav-jobs";
import { formatSoles, todayUtcRange } from "@life-manager/shared/finance/constants";
import { sumExpensesToday, sumKcalToday } from "@life-manager/shared/finance/summaries";
import type { FoodItemRow } from "@life-manager/shared/finance/food";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NutritionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const userJobs = await getUserNavJobs(supabase, user.id);
  const { start, end } = todayUtcRange();

  const [{ data: foodsRaw }, { data: movements }, { data: paymentAccounts }] = await Promise.all([
    supabase
      .from("food_items")
      .select(
        "id, tpca_code, name, food_group, kcal_per_100g, default_serving_g, serving_label, default_price_soles, brand",
      )
      .eq("is_active", true)
      .order("food_group")
      .order("name"),
    supabase
      .from("finance_movements")
      .select("id, occurred_at, direction, amount_soles, kcal, label, payment_method, source, category")
      .eq("user_id", user.id)
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .not("kcal", "is", null)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("user_payment_accounts")
      .select("id, slug, label, sort_order, is_active, user_account_balances(balance_soles)")
      .eq("user_id", user.id)
      .order("sort_order"),
  ]);

  const foods = (foodsRaw ?? []) as FoodItemRow[];
  const rows = (movements ?? []).map((row) => ({
    ...row,
    kcal: row.kcal ?? 0,
    payment_method: row.payment_method,
  }));

  const kcalToday = sumKcalToday(rows);
  const foodSpendToday = sumExpensesToday(rows.filter((row) => row.source === "food"));

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader userJobs={userJobs} />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-panel p-5 border border-line/60">
            <p className="text-sm text-muted">Kcal hoy</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-teal">
              {kcalToday}
            </p>
          </div>
          <div className="rounded-2xl bg-panel p-5 border border-line/60">
            <p className="text-sm text-muted">Gasto comida hoy</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
              {formatSoles(foodSpendToday)}
            </p>
          </div>
        </div>

        <div className="mt-3 mb-6">
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-teal">
            BOTÁNICO
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-ink">
            Nutrición
          </h1>
        </div>

        <div className="mb-6">
          <WalletBalances
            accounts={(paymentAccounts ?? []).map((row) => {
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
            })}
          />
        </div>

        <FoodLogForm foods={foods} />

        <section className="mt-6 rounded-2xl bg-panel p-5 border border-line/60">
          <p className="mb-3 font-medium text-ink">Registros de hoy</p>
          {(movements ?? []).length === 0 ? (
            <p className="text-sm text-muted">Sin registros todavía.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(movements ?? []).map((row) => (
                <li key={row.id} className="flex justify-between gap-3 border-b border-line/60 py-2 last:border-0">
                  <span className="text-ink">{row.label}</span>
                  <span className="shrink-0 text-muted">
                    {row.kcal ?? 0} kcal · {formatSoles(Number(row.amount_soles))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
