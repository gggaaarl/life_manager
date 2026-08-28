import { AppHeader } from "@/components/layout/app-header";
import { PaymentAccountsSettings } from "@/components/finance/payment-accounts-settings";
import { sortPaymentAccountsForDisplay } from "@/components/finance/sort-payment-accounts";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FinanceConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const accessProfile = await getProfileAccess(supabase, user.id);
  const showPlayerMenu = canAccessPlayerMenu(accessProfile, user.id);

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
      <AppHeader showPlayerMenu showFinanceMenu showNutritionMenu />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Link href="/finance" className="text-sm font-medium text-teal">
          ← Finanzas
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Configuración de finanzas
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
