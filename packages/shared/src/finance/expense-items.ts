import type { ExpenseCategory } from "./constants";

export type ExpenseItemRow = {
  id: string;
  name: string;
  brand: string | null;
  default_category: ExpenseCategory;
  default_price_soles: number;
  user_id: string | null;
};

export function normalizeExpenseLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
