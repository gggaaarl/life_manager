"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { logManualExpense } from "@/app/finance/actions";
import {
  FINANCE_MANUAL_EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@life-manager/shared/finance/constants";
import { normalizeExpenseLabel, type ExpenseItemRow } from "@life-manager/shared/finance/expense-items";

function formatItemOption(item: ExpenseItemRow): string {
  if (item.default_price_soles > 0) {
    return `${item.name} · S/ ${item.default_price_soles.toFixed(2)}`;
  }
  return item.name;
}

export function FinanceForms({
  workDate,
  expenseItems,
}: {
  workDate: string;
  expenseItems: ExpenseItemRow[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("comida");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = normalizeExpenseLabel(query);
    const pool = expenseItems.filter((item) => item.default_category === category);
    if (!q) {
      return pool.slice(0, 20);
    }
    return pool
      .filter(
        (item) =>
          normalizeExpenseLabel(item.name).includes(q) ||
          normalizeExpenseLabel(item.brand ?? "").includes(q),
      )
      .slice(0, 20);
  }, [category, expenseItems, query]);

  const isNewItem =
    query.trim().length > 0 &&
    !expenseItems.some(
      (item) =>
        item.default_category === category &&
        normalizeExpenseLabel(item.name) === normalizeExpenseLabel(query),
    );

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setListOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function pickItem(item: ExpenseItemRow) {
    setQuery(item.name);
    setSelectedId(item.id);
    setListOpen(false);
    if (item.default_price_soles > 0) {
      setAmount(String(item.default_price_soles));
    }
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        const label = query.trim();
        if (!label) {
          setError("Elige o escribe un ítem.");
          return;
        }
        formData.set("label", label);
        formData.set("category", category);
        formData.set("fecha", workDate);
        if (selectedId && !isNewItem) {
          formData.set("expense_item_id", selectedId);
        }
        startTransition(async () => {
          try {
            await logManualExpense(formData);
            setQuery("");
            setSelectedId(null);
            setAmount("");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error.");
          }
        });
      }}
      className="space-y-3 rounded-xl border border-line bg-panel p-4 shadow-sm"
    >
      <p className="font-semibold text-ink">Registrar gasto</p>

      <select
        name="category"
        value={category}
        onChange={(event) => {
          setCategory(event.target.value as ExpenseCategory);
          setSelectedId(null);
        }}
        className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
      >
        {FINANCE_MANUAL_EXPENSE_CATEGORIES.map((value) => (
          <option key={value} value={value}>
            {EXPENSE_CATEGORY_LABELS[value]}
          </option>
        ))}
      </select>

      <div ref={rootRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedId(null);
            setListOpen(true);
          }}
          onFocus={() => setListOpen(true)}
          placeholder="Buscar o escribir ítem…"
          autoComplete="off"
          className="w-full rounded-lg border border-line bg-sand px-3 py-2 text-sm"
        />
        {listOpen && filtered.length > 0 ? (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-line bg-panel shadow-md">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => pickItem(item)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-sand/80"
                >
                  {formatItemOption(item)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

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
