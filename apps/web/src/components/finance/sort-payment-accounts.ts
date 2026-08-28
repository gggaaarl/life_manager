import type { PaymentAccountRow } from "@/components/finance/wallet-balances";

/** Efectivo siempre al final; el resto por sort_order. */
export function sortPaymentAccountsForDisplay(accounts: PaymentAccountRow[]): PaymentAccountRow[] {
  const active = accounts.filter((row) => row.is_active);
  const efectivo = active.filter((row) => row.slug === "efectivo");
  const others = active
    .filter((row) => row.slug !== "efectivo")
    .sort((a, b) => a.sort_order - b.sort_order);
  return [...others, ...efectivo];
}
