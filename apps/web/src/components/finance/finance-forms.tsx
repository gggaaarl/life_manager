"use client";

import { useMemo, useState, useTransition } from "react";
import { logManualExpense } from "@/app/finance/actions";
import {
  FINANCE_MANUAL_EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@life-manager/shared/finance/constants";
import { normalizeExpenseLabel, type ExpenseItemRow } from "@life-manager/shared/finance/expense-items";
import { nowTimeInLima } from "@life-manager/shared/finance/summaries";

type PaymentAccountOption = {
  id: string;
  label: string;
};

export function FinanceForms({
  workDate,
  paymentAccounts,
  expenseItems,
}: {
  workDate: string;
  paymentAccounts: PaymentAccountOption[];
  expenseItems: ExpenseItemRow[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("comida");
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = normalizeExpenseLabel(search);
    const pool = expenseItems.filter((item) => item.default_category === category);
    if (!q) {
      return pool.slice(0, 30);
    }
    return pool
      .filter(
        (item) =>
          normalizeExpenseLabel(item.name).includes(q) ||
          normalizeExpenseLabel(item.brand ?? "").includes(q),
      )
      .slice(0, 30);
  }, [category, expenseItems, search]);

  const selected = expenseItems.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const isNewItem =
    search.trim().length > 0 &&
    !expenseItems.some(
      (item) =>
        item.default_category === category &&
        normalizeExpenseLabel(item.name) === normalizeExpenseLabel(search),
    );

  return (
    <form
      action={(formData) => {
        setError(null);
        const label = search.trim() || selected?.name || "";
        if (!label) {
          setError("Elige o escribe un ítem.");
          return;
        }
        formData.set("label", label);
        formData.set("category", category);
        if (selected && !isNewItem) {
          formData.set("expense_item_id", selected.id);
        }
        startTransition(async () => {
          try {
            await logManualExpense(formData);
            setSearch("");
            setSelectedId("");
            setAmount("");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="space-y-3 rounded-xl border border-line bg-panel p-4 shadow-sm"
    >
      <p className="font-semibold text-ink">Registrar gasto</p>
      <p className="text-xs text-muted">
        Elige del catálogo o escribe un nombre nuevo (se crea automáticamente la primera vez).
      </p>

      <select
        name="category"
        value={category}
        onChange={(event) => {
          setCategory(event.target.value as ExpenseCategory);
          setSelectedId("");
        }}
        className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
      >
        {FINANCE_MANUAL_EXPENSE_CATEGORIES.map((value) => (
          <option key={value} value={value}>
            {EXPENSE_CATEGORY_LABELS[value]}
          </option>
        ))}
      </select>

      <input
        type="search"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setSelectedId("");
        }}
        placeholder="Buscar o escribir ítem…"
        className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
      />

      {filtered.length > 0 ? (
        <select
          value={selected?.id ?? ""}
          onChange={(event) => {
            setSelectedId(event.target.value);
            const item = expenseItems.find((row) => row.id === event.target.value);
            if (item) {
              setSearch(item.name);
              if (!amount) {
                setAmount(String(item.default_price_soles || ""));
              }
            }
          }}
          className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
        >
          {filtered.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.brand ? ` · ${item.brand}` : ""}
              {item.default_price_soles > 0 ? ` · S/ ${item.default_price_soles.toFixed(2)}` : ""}
            </option>
          ))}
        </select>
      ) : null}

      {isNewItem ? (
        <p className="text-xs text-teal">Nuevo ítem: se agregará al catálogo al guardar.</p>
      ) : null}

      <input
        required
        type="number"
        step="0.01"
        min={0}
        name="amount_soles"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Monto"
        className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
      />
      <select
        name="payment_account_id"
        className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
      >
        <option value="">Sin cuenta</option>
        {paymentAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.label}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          name="fecha"
          defaultValue={workDate}
          className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
        />
        <input
          type="time"
          name="hora"
          defaultValue={nowTimeInLima()}
          className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar gasto"}
      </button>
    </form>
  );
}
