import { AppHeader } from "@/components/layout/app-header";
import { FinanceNavTabs } from "@/components/finance/finance-nav-tabs";
import { PaymentAccountsSettings } from "@/components/finance/payment-accounts-settings";
import { sortPaymentAccountsForDisplay } from "@/components/finance/sort-payment-accounts";
import { getUserNavJobs } from "@/lib/nav/get-user-nav-jobs";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function FinanceConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const userJobs = await getUserNavJobs(supabase, user.id);

  const { data: paymentAccounts } = await supabase
    .from("user_payment_accounts")
    .select("id, slug, label, sort_order, is_active")
    .eq("user_id", user.id)
    .order("sort_order");

  const accounts = sortPaymentAccountsForDisplay(
    (paymentAccounts ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      label: row.label,
      sort_order: row.sort_order,
      is_active: row.is_active,
      balance_soles: 0,
    })),
  ).map(({ id, slug, label, is_active }) => ({ id, slug, label, is_active }));

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader userJobs={userJobs} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <FinanceNavTabs />
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-muted">
          Activa las cuentas que usas y agrega nuevas (ej. BBVA · mamá, SIP · mamá).
        </p>

        <div className="mt-6">
          <PaymentAccountsSettings accounts={accounts} alwaysOpen />
        </div>
      </div>
    </main>
  );
}
