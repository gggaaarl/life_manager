import { resolveAccountSnapshotsAsOf } from "@life-manager/shared/finance/ledger";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Si el día no tiene cierre propio, copia el último cierre anterior (nunca fechas futuras). */
export async function ensureDayOpenedFromPrevious(
  supabase: Supabase,
  userId: string,
  workDate: string,
) {
  const { data: onThisDay } = await supabase
    .from("user_account_balance_snapshots")
    .select("payment_account_id")
    .eq("user_id", userId)
    .eq("balance_date", workDate)
    .limit(1);

  if ((onThisDay ?? []).length > 0) {
    return;
  }

  const { data: previous } = await supabase
    .from("user_account_balance_snapshots")
    .select("payment_account_id, balance_date, balance_soles")
    .eq("user_id", userId)
    .lt("balance_date", workDate);

  const carried = resolveAccountSnapshotsAsOf(previous ?? [], workDate);
  if (carried.size === 0) {
    return;
  }

  const { data: accounts } = await supabase
    .from("user_payment_accounts")
    .select("id, slug")
    .eq("user_id", userId);

  const skip = new Set(
    (accounts ?? []).filter((row) => row.slug === "efectivo").map((row) => row.id),
  );

  const rows = [...carried.entries()]
    .filter(([id]) => !skip.has(id))
    .map(([payment_account_id, balance_soles]) => ({
      user_id: userId,
      payment_account_id,
      balance_date: workDate,
      balance_soles,
      updated_at: new Date().toISOString(),
    }));

  if (rows.length === 0) {
    return;
  }

  await supabase.from("user_account_balance_snapshots").upsert(rows, {
    onConflict: "user_id,payment_account_id,balance_date",
  });
}
