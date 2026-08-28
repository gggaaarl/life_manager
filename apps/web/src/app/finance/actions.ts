"use server";

import { createClient } from "@/lib/supabase/server";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type ExpenseCategory,
  type PaymentMethod,
  DRIVER_EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  FINANCE_MANUAL_EXPENSE_CATEGORIES,
} from "@life-manager/shared/finance/constants";
import { computeFoodLogValues } from "@life-manager/shared/finance/food";
import { parseFormDateTime, occurredAtForWorkDate, todayInLima } from "@life-manager/shared/finance/summaries";
import { normalizeExpenseLabel } from "@life-manager/shared/finance/expense-items";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}

function parseAmount(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Monto inválido.");
  }
  return Math.round(parsed * 100) / 100;
}

function parseKcal(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Kcal inválidas.");
  }
  return parsed;
}

function parsePaymentAccountId(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text || null;
}

function parsePaymentMethod(value: FormDataEntryValue | null): PaymentMethod | null {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
  if (!PAYMENT_METHODS.includes(text as PaymentMethod)) {
    throw new Error("Método de pago inválido.");
  }
  return text as PaymentMethod;
}

function parseCategory(value: FormDataEntryValue | null): ExpenseCategory | null {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
  if (!EXPENSE_CATEGORIES.includes(text as ExpenseCategory)) {
    throw new Error("Categoría inválida.");
  }
  return text as ExpenseCategory;
}

function parseOccurredAt(formData: FormData): string {
  return parseFormDateTime(formData.get("fecha"), formData.get("hora"));
}

async function getDriverJobId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: job } = await supabase.from("jobs").select("id").eq("code", "DRIVER").single();
  if (!job) {
    throw new Error("Job Chofer no configurado.");
  }
  return job.id;
}

type ResolvedExpenseItem = {
  id: string;
  name: string;
  default_category: ExpenseCategory;
};

async function resolveExpenseItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  rawLabel: string,
  category: ExpenseCategory,
  amountSoles: number,
  explicitItemId?: string | null,
): Promise<ResolvedExpenseItem> {
  if (explicitItemId) {
    const { data: picked, error } = await supabase
      .from("expense_items")
      .select("id, name, default_category")
      .eq("id", explicitItemId)
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .maybeSingle();

    if (error || !picked) {
      throw new Error("Ítem de gasto no encontrado.");
    }

    return {
      id: picked.id,
      name: picked.name,
      default_category: picked.default_category as ExpenseCategory,
    };
  }

  const label = rawLabel.trim();
  const normalized = normalizeExpenseLabel(label);

  const { data: aliasHit } = await supabase
    .from("expense_item_aliases")
    .select("expense_item_id, expense_items(id, name, default_category)")
    .ilike("alias", normalized)
    .maybeSingle();

  const aliasRow = aliasHit?.expense_items;
  const aliasItem = Array.isArray(aliasRow) ? aliasRow[0] : aliasRow;
  if (aliasItem) {
    return {
      id: aliasItem.id,
      name: aliasItem.name,
      default_category: aliasItem.default_category as ExpenseCategory,
    };
  }

  const { data: catalogItems } = await supabase
    .from("expense_items")
    .select("id, name, default_category")
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .eq("default_category", category)
    .eq("is_active", true);

  const nameMatch = (catalogItems ?? []).find(
    (item) => normalizeExpenseLabel(item.name) === normalized,
  );
  if (nameMatch) {
    return {
      id: nameMatch.id,
      name: nameMatch.name,
      default_category: nameMatch.default_category as ExpenseCategory,
    };
  }

  const { data: created, error: createError } = await supabase
    .from("expense_items")
    .insert({
      user_id: userId,
      name: label,
      default_category: category,
      default_price_soles: amountSoles,
    })
    .select("id, name, default_category")
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? "No se pudo crear el ítem de gasto.");
  }

  return {
    id: created.id,
    name: created.name,
    default_category: created.default_category as ExpenseCategory,
  };
}

export async function logFoodFromItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const foodItemId = String(formData.get("food_item_id") ?? "").trim();
  if (!foodItemId) {
    throw new Error("Selecciona un alimento.");
  }

  const paymentMethod = parsePaymentMethod(formData.get("payment_method"));
  if (!paymentMethod) {
    throw new Error("Indica con qué pagaste.");
  }

  const { data: item, error: itemError } = await supabase
    .from("food_items")
    .select("id, name, kcal_per_100g, default_serving_g, default_price_soles")
    .eq("id", foodItemId)
    .single();

  if (itemError || !item) {
    throw new Error("Alimento no encontrado.");
  }

  const servingGRaw = formData.get("serving_g");
  const servingG = servingGRaw ? Number(servingGRaw) : undefined;
  const computed = computeFoodLogValues(item, servingG);
  const amount = parseAmount(formData.get("amount_soles") ?? String(computed.price));
  const kcal = parseKcal(formData.get("kcal") ?? String(computed.kcal));
  const occurredAt = parseOccurredAt(formData);

  const { error } = await supabase.from("finance_movements").insert({
    user_id: user.id,
    occurred_at: occurredAt,
    direction: "out",
    amount_soles: amount,
    payment_method: paymentMethod,
    kcal,
    food_item_id: item.id,
    source: "food",
    category: "comida_bebida",
    label: item.name,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/nutrition");
  revalidatePath("/finance");
}

export async function setOpeningBalances(formData: FormData) {
  const { supabase, user } = await requireUser();

  const yape = parseAmount(formData.get("yape") ?? "0");
  const plin = parseAmount(formData.get("plin") ?? "0");
  const efectivo = parseAmount(formData.get("efectivo") ?? "0");

  const { count } = await supabase
    .from("finance_movements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("source", "opening_balance");

  if ((count ?? 0) > 0) {
    throw new Error("Ya configuraste saldo inicial. Contacta soporte para reiniciar.");
  }

  const rows = [
    { amount: yape, method: "yape" as PaymentMethod, label: "Capital inicial Yape" },
    { amount: plin, method: "plin" as PaymentMethod, label: "Capital inicial Plin" },
    { amount: efectivo, method: "efectivo" as PaymentMethod, label: "Capital inicial efectivo" },
  ].filter((row) => row.amount > 0);

  if (rows.length === 0) {
    throw new Error("Ingresa al menos un saldo.");
  }

  const { error } = await supabase.from("finance_movements").insert(
    rows.map((row) => ({
      user_id: user.id,
      occurred_at: new Date().toISOString(),
      direction: "in" as const,
      amount_soles: row.amount,
      payment_method: row.method,
      source: "opening_balance" as const,
      label: row.label,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
  revalidatePath("/driver");
}

export async function logManualExpense(formData: FormData) {
  const { supabase, user } = await requireUser();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) {
    throw new Error("Descripción obligatoria.");
  }

  const category = parseCategory(formData.get("category")) ?? "otro";
  const amountSoles = parseAmount(formData.get("amount_soles"));
  const expenseItemId = String(formData.get("expense_item_id") ?? "").trim() || null;
  const workDate = String(formData.get("fecha") ?? "").trim() || todayInLima();

  const item = await resolveExpenseItem(
    supabase,
    user.id,
    label,
    category,
    amountSoles,
    expenseItemId,
  );

  const { error } = await supabase.from("finance_movements").insert({
    user_id: user.id,
    occurred_at: occurredAtForWorkDate(workDate),
    direction: "out",
    amount_soles: amountSoles,
    source: "expense",
    category: item.default_category,
    expense_item_id: item.id,
    label: item.name,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
}

export async function logManualIncome(formData: FormData) {
  const { supabase, user } = await requireUser();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) {
    throw new Error("Descripción obligatoria.");
  }

  const paymentMethod = parsePaymentMethod(formData.get("payment_method"));
  if (!paymentMethod) {
    throw new Error("Indica cómo te pagaron.");
  }

  const { error } = await supabase.from("finance_movements").insert({
    user_id: user.id,
    occurred_at: parseOccurredAt(formData),
    direction: "in",
    amount_soles: parseAmount(formData.get("amount_soles")),
    payment_method: paymentMethod,
    source: "income",
    label,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
}

export async function logDriverIncome(formData: FormData) {
  const { supabase, user } = await requireUser();
  const paymentMethod = parsePaymentMethod(formData.get("payment_method"));
  if (paymentMethod !== "yape" && paymentMethod !== "efectivo") {
    throw new Error("Indica Yape o efectivo.");
  }

  const jobId = await getDriverJobId(supabase);
  const amount = parseAmount(formData.get("amount_soles"));
  const label = `Carrera ${PAYMENT_METHOD_LABELS[paymentMethod]}`;

  const { error } = await supabase.from("finance_movements").insert({
    user_id: user.id,
    occurred_at: new Date().toISOString(),
    direction: "in",
    amount_soles: amount,
    payment_method: paymentMethod,
    job_id: jobId,
    source: "driver_income",
    label,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/driver");
  revalidatePath("/finance");
}

export async function logDriverExpense(formData: FormData) {
  const { supabase, user } = await requireUser();
  const category = parseCategory(formData.get("category"));
  if (!category) {
    throw new Error("Selecciona categoría del vehículo.");
  }

  const paymentMethod = parsePaymentMethod(formData.get("payment_method"));
  if (paymentMethod !== "yape" && paymentMethod !== "efectivo") {
    throw new Error("Indica Yape o efectivo.");
  }

  const label =
    category in DRIVER_EXPENSE_CATEGORY_LABELS
      ? DRIVER_EXPENSE_CATEGORY_LABELS[category as keyof typeof DRIVER_EXPENSE_CATEGORY_LABELS]
      : EXPENSE_CATEGORY_LABELS[category];

  const jobId = await getDriverJobId(supabase);

  const { error } = await supabase.from("finance_movements").insert({
    user_id: user.id,
    occurred_at: new Date().toISOString(),
    direction: "out",
    amount_soles: parseAmount(formData.get("amount_soles")),
    payment_method: paymentMethod,
    job_id: jobId,
    source: "driver_expense",
    category,
    label,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/driver");
  revalidatePath("/finance");
}

export async function upsertPaymentAccount(formData: FormData) {
  const { supabase, user } = await requireUser();

  const activeIds = new Set(
    formData.getAll("active_ids").map((value) => String(value)),
  );

  const { data: accounts, error: listError } = await supabase
    .from("user_payment_accounts")
    .select("id, sort_order")
    .eq("user_id", user.id);

  if (listError) {
    throw new Error(listError.message);
  }

  for (const account of accounts ?? []) {
    const isActive = activeIds.has(account.id);
    const { error } = await supabase
      .from("user_payment_accounts")
      .update({ is_active: isActive })
      .eq("id", account.id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const label = String(formData.get("label") ?? "").trim();

  if (slug && label) {
    const maxOrder = Math.max(0, ...(accounts ?? []).map((row) => row.sort_order)) + 1;

    const { data: inserted, error: insertError } = await supabase
      .from("user_payment_accounts")
      .insert({
        user_id: user.id,
        slug,
        label,
        sort_order: maxOrder,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

  if (inserted) {
      const { error: balanceError } = await supabase.from("user_account_balances").upsert(
        {
          user_id: user.id,
          payment_account_id: inserted.id,
          balance_soles: 0,
        },
        { onConflict: "user_id,payment_account_id" },
      );
      if (balanceError) {
        throw new Error(balanceError.message);
      }
    }
  }

  revalidatePath("/finance");
  revalidatePath("/finance/configuracion");
  revalidatePath("/nutrition");
}

export async function updateMovement(formData: FormData) {
  const { supabase, user } = await requireUser();
  const movementId = String(formData.get("movement_id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!movementId || !label) {
    throw new Error("Datos incompletos.");
  }

  const amount = parseAmount(formData.get("amount_soles"));
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const patch: {
    label: string;
    amount_soles: number;
    category?: ExpenseCategory;
  } = { label, amount_soles: amount };

  if (categoryRaw) {
    if (!FINANCE_MANUAL_EXPENSE_CATEGORIES.includes(categoryRaw as (typeof FINANCE_MANUAL_EXPENSE_CATEGORIES)[number])) {
      throw new Error("Categoría inválida.");
    }
    patch.category = categoryRaw as ExpenseCategory;
  }

  const { error } = await supabase
    .from("finance_movements")
    .update(patch)
    .eq("id", movementId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
  revalidatePath("/driver");
  revalidatePath("/nutrition");
}

export async function deleteMovement(movementId: string) {
  const { supabase, user } = await requireUser();
  if (!movementId) {
    throw new Error("Movimiento inválido.");
  }

  const { error } = await supabase
    .from("finance_movements")
    .delete()
    .eq("id", movementId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
  revalidatePath("/driver");
  revalidatePath("/nutrition");
}

export async function updateExpenseCategory(movementId: string, category: ExpenseCategory) {
  const { supabase, user } = await requireUser();

  if (!FINANCE_MANUAL_EXPENSE_CATEGORIES.includes(category as (typeof FINANCE_MANUAL_EXPENSE_CATEGORIES)[number])) {
    throw new Error("Categoría no válida para gasto personal.");
  }

  const { error } = await supabase
    .from("finance_movements")
    .update({ category })
    .eq("id", movementId)
    .eq("user_id", user.id)
    .in("source", ["expense", "food"]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
}

export async function updateAccountAllocation(formData: FormData) {
  const { supabase, user } = await requireUser();
  const accountId = String(formData.get("account_id") ?? "").trim();
  const amount = parseAmount(formData.get("amount_soles"));
  const workDate = String(formData.get("work_date") ?? "").trim() || todayInLima();

  if (!accountId) {
    throw new Error("Cuenta inválida.");
  }

  const { data: account } = await supabase
    .from("user_payment_accounts")
    .select("slug")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();

  if (!account) {
    throw new Error("Cuenta no encontrada.");
  }

  if (account.slug === "efectivo") {
    throw new Error("Efectivo se calcula automáticamente.");
  }

  const { error } = await supabase.from("user_account_balance_snapshots").upsert(
    {
      user_id: user.id,
      payment_account_id: accountId,
      balance_date: workDate,
      balance_soles: amount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,payment_account_id,balance_date" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
}
