"use client";

import { useMemo, useState, useTransition } from "react";
import { logFoodFromItem } from "@/app/finance/actions";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "@life-manager/shared/finance/constants";
import {
  computeFoodLogValues,
  type FoodItemRow,
} from "@life-manager/shared/finance/food";

export function FoodLogForm({ foods }: { foods: FoodItemRow[] }) {
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(foods[0]?.id ?? "");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return foods.slice(0, 30);
    }
    return foods
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.food_group.toLowerCase().includes(q) ||
          (item.tpca_code ?? "").toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [foods, search]);

  const selected = foods.find((item) => item.id === selectedId) ?? filtered[0];
  const preview = selected ? computeFoodLogValues(selected) : null;

  function handleSubmit(formData: FormData) {
    if (!selected) {
      return;
    }
    setError(null);
    formData.set("food_item_id", selected.id);
    startTransition(async () => {
      try {
        await logFoodFromItem(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al registrar.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-2xl bg-panel p-5 border border-line/60">
      <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
        Registrar comida / bebida
      </p>
      <p className="text-sm text-muted">
        Base TPCA del INS. Un registro descuenta de tu billetera y suma kcal.
      </p>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Buscar alimento</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="arroz, pollo, inka zero..."
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Alimento</span>
        <select
          value={selected?.id ?? ""}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
        >
          {filtered.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.serving_label} · {item.kcal_per_100g} kcal/100g
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <p className="text-xs text-muted">
          {selected.food_group}
          {selected.tpca_code ? ` · ${selected.tpca_code}` : ""}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Porción (g)</span>
          <input
            type="number"
            min={1}
            name="serving_g"
            defaultValue={preview?.servingG ?? 100}
            key={`serving-${selected?.id}`}
            className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Precio S/</span>
          <input
            type="number"
            step="0.01"
            min={0}
            name="amount_soles"
            defaultValue={preview?.price ?? 0}
            key={`price-${selected?.id}`}
            className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Kcal</span>
          <input
            type="number"
            step="0.1"
            min={0}
            name="kcal"
            defaultValue={preview?.kcal ?? 0}
            key={`kcal-${selected?.id}`}
            className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Pagaste con</span>
          <select
            name="payment_method"
            defaultValue="efectivo"
            className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
          >
            {PAYMENT_METHODS.filter((m) => m !== "otro").map((value) => (
              <option key={value} value={value}>
                {PAYMENT_METHOD_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-ink">Fecha</span>
        <input
          type="date"
          name="fecha"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
        />
      </label>

      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}

      <button
        type="submit"
        disabled={pending || !selected}
        className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Registrar"}
      </button>
    </form>
  );
}
