import { formatSoles } from "@life-manager/shared/finance/constants";
import { sortPaymentAccountsForDisplay } from "@/components/finance/sort-payment-accounts";

export type PaymentAccountRow = {
  id: string;
  label: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  balance_soles: number;
};

export function WalletBalances({ accounts }: { accounts: PaymentAccountRow[] }) {
  const active = sortPaymentAccountsForDisplay(accounts);
  const total = active.reduce((sum, row) => sum + Number(row.balance_soles), 0);

  return (
    <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <p className="text-sm font-semibold text-ink">Balance actual</p>
        <p className="font-[family-name:var(--font-display)] text-xl font-bold text-teal tabular-nums">
          {formatSoles(total)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {active.map((account) => (
          <div
            key={account.id}
            className="rounded-lg border border-line bg-sand/50 px-3 py-2"
          >
            <p className="text-xs text-muted">{account.label}</p>
            <p className="text-base font-semibold tabular-nums text-ink">
              {formatSoles(Number(account.balance_soles))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
