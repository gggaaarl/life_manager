export const PAYMENT_METHODS = ["yape", "plin", "efectivo", "otro"] as const;
export const MOVEMENT_DIRECTIONS = ["in", "out"] as const;
export const MOVEMENT_SOURCES = [
  "food",
  "expense",
  "income",
  "driver_income",
  "driver_expense",
] as const;
export const EXPENSE_CATEGORIES = [
  "comida",
  "bebida",
  "medicina",
  "higiene",
  "ocio",
  "comida_bebida",
  "combustible_gnv",
  "combustible_gasolina",
  "app_saldo",
  "llantas",
  "mantenimiento",
  "otro",
] as const;

/** Gastos manuales en dashboard Finanzas. */
export const FINANCE_MANUAL_EXPENSE_CATEGORIES = [
  "comida",
  "bebida",
  "medicina",
  "higiene",
  "ocio",
  "otro",
] as const satisfies readonly ExpenseCategory[];

/** Gastos en dashboard Chofer / taxi. */
export const DRIVER_EXPENSE_CATEGORIES = [
  "combustible_gnv",
  "combustible_gasolina",
  "llantas",
  "app_saldo",
] as const satisfies readonly ExpenseCategory[];

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type MovementDirection = (typeof MOVEMENT_DIRECTIONS)[number];
export type MovementSource = (typeof MOVEMENT_SOURCES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  yape: "Yape",
  plin: "Plin",
  efectivo: "Efectivo",
  otro: "Otro",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  comida: "Comida",
  bebida: "Bebida",
  medicina: "Medicina",
  higiene: "Higiene",
  ocio: "Ocio",
  comida_bebida: "Comida / bebida",
  combustible_gnv: "GNV",
  combustible_gasolina: "Gasolina",
  app_saldo: "Saldo",
  llantas: "Llantas",
  mantenimiento: "Mantenimiento",
  otro: "Otro",
};

export const GNV_BARS = [5, 4, 3, 2, 1] as const;
export type GnvBar = (typeof GNV_BARS)[number];

export const GNV_BAR_LABELS: Record<GnvBar, string> = {
  5: "Barra 5",
  4: "Barra 4",
  3: "Barra 3",
  2: "Barra 2",
  1: "Barra 1 (roja)",
};

/** Barras 5–2 verdes en el contador; barra 1 indica GNV casi agotado. */
export function gnvBarTone(bar: GnvBar): "green" | "red" {
  return bar === 1 ? "red" : "green";
}


export const DRIVER_EXPENSE_CATEGORY_LABELS: Record<
  (typeof DRIVER_EXPENSE_CATEGORIES)[number],
  string
> = {
  combustible_gnv: "GNV",
  combustible_gasolina: "Gasolina",
  llantas: "Llantas",
  app_saldo: "Saldo",
};

export function todayUtcRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatSoles(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}
