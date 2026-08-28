import {
  formatSoles,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@life-manager/shared/finance/constants";

type WalletRow = {
  payment_method: PaymentMethod;
  balance_soles: number;
};

export function WalletBalances({ wallets }: { wallets: WalletRow[] }) {
  const methods: PaymentMethod[] = ["yape", "plin", "efectivo"];
  const byMethod = new Map(wallets.map((row) => [row.payment_method, row.balance_soles]));
  const total = methods.reduce((sum, method) => sum + Number(byMethod.get(method) ?? 0), 0);

  return (
    <div className="rounded-2xl bg-panel p-5 border border-line/60">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-medium text-ink">Tus billeteras</p>
          <p className="text-sm text-muted">Saldo actual por método de pago</p>
        </div>
        <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-teal">
          {formatSoles(total)}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {methods.map((method) => (
          <div key={method} className="rounded-xl bg-sand/50 px-3 py-2">
            <p className="text-xs text-muted">{PAYMENT_METHOD_LABELS[method]}</p>
            <p className="text-lg font-semibold text-ink">
              {formatSoles(Number(byMethod.get(method) ?? 0))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
