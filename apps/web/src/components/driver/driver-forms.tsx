"use client";

import { useRef, useState, useTransition } from "react";
import { logDriverExpense, logDriverIncome } from "@/app/finance/actions";
import {
  DRIVER_EXPENSE_CATEGORIES,
  DRIVER_EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@life-manager/shared/finance/constants";

export function DriverForms() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DriverIncomeForm />
      <DriverExpenseForm />
    </div>
  );
}

function DriverIncomeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(paymentMethod: "yape" | "efectivo") {
    const form = formRef.current;
    if (!form) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    setError(null);
    const formData = new FormData(form);
    formData.set("amount_soles", String(value));
    formData.set("payment_method", paymentMethod);
    startTransition(async () => {
      try {
        await logDriverIncome(formData);
        setAmount("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error.");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line/60 bg-panel p-5">
      <p className="font-semibold text-ink">Ingreso de carrera</p>
      <form ref={formRef}>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Monto S/</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-line bg-sand/40 px-4 py-4 text-2xl font-semibold tabular-nums outline-none focus:border-teal"
          />
        </label>
      </form>
      <div className="grid grid-cols-2 gap-3">
        <PaymentButton
          label="Yape"
          tone="yape"
          disabled={pending}
          onClick={() => submit("yape")}
        />
        <PaymentButton
          label="Efectivo"
          tone="cash"
          disabled={pending}
          onClick={() => submit("efectivo")}
        />
      </div>
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      {pending ? <p className="text-sm text-muted">Guardando…</p> : null}
    </div>
  );
}

function DriverExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("combustible_gnv");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(paymentMethod: "yape" | "efectivo") {
    const form = formRef.current;
    if (!form) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    setError(null);
    const formData = new FormData(form);
    formData.set("amount_soles", String(value));
    formData.set("payment_method", paymentMethod);
    formData.set("category", category);
    startTransition(async () => {
      try {
        await logDriverExpense(formData);
        setAmount("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error.");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line/60 bg-panel p-5">
      <p className="font-semibold text-ink">Gasto del vehículo</p>
      <div className="grid grid-cols-2 gap-2">
        {DRIVER_EXPENSE_CATEGORIES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              category === value
                ? "border-teal bg-teal/15 text-teal"
                : "border-line bg-sand/40 text-ink hover:border-teal/40"
            }`}
          >
            {DRIVER_EXPENSE_CATEGORY_LABELS[value]}
          </button>
        ))}
      </div>
      <form ref={formRef}>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Monto S/</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-line bg-sand/40 px-4 py-4 text-2xl font-semibold tabular-nums outline-none focus:border-teal"
          />
        </label>
      </form>
      <div className="grid grid-cols-2 gap-3">
        <PaymentButton
          label="Yape"
          tone="yape"
          disabled={pending}
          onClick={() => submit("yape")}
        />
        <PaymentButton
          label="Efectivo"
          tone="cash"
          disabled={pending}
          onClick={() => submit("efectivo")}
        />
      </div>
      {error ? <p className="text-sm text-[var(--lm-danger)]">{error}</p> : null}
      {pending ? <p className="text-sm text-muted">Guardando…</p> : null}
    </div>
  );
}

function PaymentButton({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: "yape" | "cash";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 py-4 text-base font-bold transition disabled:opacity-60 ${
        tone === "yape"
          ? "border-[#6B21A8]/30 bg-[#7C3AED]/10 text-[#5B21B6] hover:bg-[#7C3AED]/20"
          : "border-forest/30 bg-forest/10 text-forest hover:bg-forest/20"
      }`}
    >
      {tone === "yape" ? <YapeIcon /> : <CashIcon />}
      {label}
    </button>
  );
}

function YapeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" />
      <path d="M9 6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 9h.01M18 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
