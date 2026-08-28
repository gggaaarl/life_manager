"use client";

import { useTransition } from "react";
import { updateExpenseCategory } from "@/app/finance/actions";
import {
  FINANCE_MANUAL_EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "@life-manager/shared/finance/constants";
import { MovementRowActions } from "@/components/finance/movement-row-actions";
import type { SheetExpenseRow, SheetIncomeRow } from "@life-manager/shared/finance/ledger";

function formatCellAmount(amount: number): string {
  return amount.toFixed(1).replace(".", ",");
}

type Props = {
  incomes: SheetIncomeRow[];
  expenses: SheetExpenseRow[];
};

export function FinanceLedgerTable({ incomes, expenses }: Props) {
  const rowCount = Math.max(incomes.length, expenses.length, 1);
  const th =
    "border border-line bg-teal/10 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink";
  const td = "border border-line bg-panel px-3 py-2 text-sm";

  return (
    <div className="overflow-x-auto rounded-xl border border-line shadow-sm">
      <table className="w-full min-w-[320px] border-collapse text-sm">
        <thead>
          <tr>
            <th className={th}>Descripción</th>
            <th className={`${th} text-right`}>Ingresos</th>
            <th className={th}>Egresos</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, index) => {
            const income = incomes[index];
            const expense = expenses[index];

            return (
              <tr key={income?.id ?? expense?.id ?? index} className="even:bg-sand/30">
                <td className={`${td} align-top`}>{income?.description ?? ""}</td>
                <td className={`${td} align-top`}>
                  {income ? <IncomeCell income={income} /> : null}
                </td>
                <td className={`${td} align-top`}>
                  {expense ? <ExpenseCell expense={expense} /> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IncomeCell({ income }: { income: SheetIncomeRow }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <span className="tabular-nums font-medium">{formatCellAmount(income.amount)}</span>
      <MovementRowActions
        movementId={income.id}
        label={income.editLabel}
        amount={income.amount}
      />
    </div>
  );
}

function ExpenseCell({ expense }: { expense: SheetExpenseRow }) {
  const [pending, startTransition] = useTransition();

  const category =
    expense.category === "comida" ||
    expense.category === "bebida" ||
    expense.category === "comida_bebida"
      ? expense.category === "comida_bebida"
        ? "comida"
        : expense.category
      : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-1">
        <span className="min-w-0 flex-1 text-ink">{expense.label}</span>
        <MovementRowActions
          movementId={expense.id}
          label={expense.label}
          amount={expense.amount}
          editableCategory={expense.editableCategory}
          category={expense.category}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        {expense.editableCategory ? (
          <select
            disabled={pending}
            defaultValue={category ?? "comida"}
            className="max-w-[7rem] rounded border border-line bg-sand px-2 py-0.5 text-xs disabled:opacity-60"
            onChange={(event) => {
              const value = event.target.value as ExpenseCategory;
              startTransition(async () => {
                await updateExpenseCategory(expense.id, value);
              });
            }}
          >
            {FINANCE_MANUAL_EXPENSE_CATEGORIES.filter((c) => c !== "otro").map((value) => (
              <option key={value} value={value}>
                {EXPENSE_CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        ) : null}
        <span className="shrink-0 tabular-nums font-medium">{formatCellAmount(expense.amount)}</span>
      </div>
    </div>
  );
}
