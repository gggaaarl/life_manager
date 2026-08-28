"use client";

import { useState, useTransition } from "react";
import { updateAccountAllocation } from "@/app/finance/actions";
import { formatSoles } from "@life-manager/shared/finance/constants";
import type { PaymentAccountAllocation } from "@life-manager/shared/finance/ledger";
import { sortPaymentAccountsForDisplay } from "@/components/finance/sort-payment-accounts";

type Props = {
  workDate: string;
  totalNet: number;
  accounts: PaymentAccountAllocation[];
};

export function WalletBalancesEditor({ workDate, totalNet, accounts }: Props) {
  const sorted = sortPaymentAccountsForDisplay(
    accounts.map((a) => ({
      id: a.id,
      slug: a.slug,
      label: a.label,
      sort_order: a.sort_order,
      is_active: a.is_active,
      balance_soles: a.allocated_soles,
    })),
  );

  const nonCashTotal = sorted
    .filter((a) => a.slug !== "efectivo")
    .reduce((s, a) => s + a.balance_soles, 0);
  const cashAccount = sorted.find((a) => a.slug === "efectivo");
  const cashAmount = Math.max(0, Math.round((totalNet - nonCashTotal) * 100) / 100);

  return (
    <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Balance actual</p>
          <p className="text-xs text-muted">Ingresos − egresos hasta esta fecha</p>
        </div>
        <p className="font-[family-name:var(--font-display)] text-xl font-bold text-teal tabular-nums">
          {formatSoles(totalNet)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {sorted.map((account) => (
          <EditableAccountCell
            key={account.id}
            accountId={account.id}
            label={account.label}
            slug={account.slug}
            value={account.slug === "efectivo" ? cashAmount : account.balance_soles}
            readOnly={account.slug === "efectivo"}
            workDate={workDate}
            maxAmount={totalNet}
          />
        ))}
      </div>
    </div>
  );
}

function EditableAccountCell({
  accountId,
  label,
  slug,
  value,
  readOnly,
  workDate,
  maxAmount,
}: {
  accountId: string;
  label: string;
  slug: string;
  value: number;
  readOnly: boolean;
  workDate: string;
  maxAmount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (readOnly) {
    return (
      <div className="rounded-lg border border-teal/30 bg-teal/5 px-3 py-2">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-base font-semibold tabular-nums text-teal">{formatSoles(value)}</p>
      </div>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg border border-line bg-sand/50 px-3 py-2 text-left transition hover:border-teal/50"
      >
        <p className="text-xs text-muted">{label}</p>
        <p className="text-base font-semibold tabular-nums text-ink">{formatSoles(value)}</p>
      </button>
    );
  }

  return (
    <form
      className="rounded-lg border border-teal/40 bg-sand/50 px-2 py-2"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await updateAccountAllocation(formData);
            setEditing(false);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
    >
      <input type="hidden" name="account_id" value={accountId} />
      <input type="hidden" name="work_date" value={workDate} />
      <p className="px-1 text-xs text-muted">{label}</p>
      <input
        name="amount_soles"
        type="number"
        step="0.01"
        min={0}
        max={maxAmount}
        defaultValue={value}
        autoFocus
        className="mt-1 w-full rounded border border-line bg-panel px-2 py-1 text-sm tabular-nums"
      />
      {error ? <p className="mt-1 text-[10px] text-[var(--lm-danger)]">{error}</p> : null}
      <div className="mt-1 flex gap-1">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded bg-teal px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-60"
        >
          {pending ? "…" : "Ok"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded border border-line px-2 py-1 text-[10px] text-muted"
        >
          ✕
        </button>
      </div>
    </form>
  );
}
