"use client";

import { useState, useTransition } from "react";
import { upsertPaymentAccount } from "@/app/finance/actions";

export type AccountOption = {
  id: string;
  label: string;
  slug: string;
  is_active: boolean;
};

export function PaymentAccountsSettings({
  accounts,
  alwaysOpen = false,
}: {
  accounts: AccountOption[];
  alwaysOpen?: boolean;
}) {
  const [open, setOpen] = useState(alwaysOpen);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isOpen = alwaysOpen || open;

  return (
    <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      {!alwaysOpen ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">Mis cuentas</p>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="text-sm font-medium text-teal"
          >
            {open ? "Cerrar" : "Editar cuentas"}
          </button>
        </div>
      ) : (
        <p className="text-sm font-semibold text-ink">Mis cuentas</p>
      )}

      {isOpen ? (
        <form
          className={`space-y-3 ${alwaysOpen ? "mt-4" : "mt-4 border-t border-line pt-4"}`}
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              try {
                await upsertPaymentAccount(formData);
                if (!alwaysOpen) {
                  setOpen(false);
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error.");
              }
            });
          }}
        >
          <div className="grid gap-2">
            {accounts.map((account) => (
              <label key={account.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active_ids"
                  value={account.id}
                  defaultChecked={account.is_active}
                />
                <span>{account.label}</span>
              </label>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              name="slug"
              placeholder="slug (ej. bbva_mama)"
              className="border border-line bg-sand px-3 py-2 text-sm"
            />
            <input
              name="label"
              placeholder="Nombre (ej. BBVA · mamá)"
              className="border border-line bg-sand px-3 py-2 text-sm"
            />
          </div>

          {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar cuentas"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
