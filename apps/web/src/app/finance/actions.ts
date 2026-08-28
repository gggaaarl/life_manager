"use server";

import { createClient } from "@/lib/supabase/server";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type ExpenseCategory,
  type GnvBar,
  type PaymentMethod,
  GNV_BARS,
  EXPENSE_CATEGORY_LABELS,
} from "@life-manager/shared/finance/constants";
import { computeFoodLogValues } from "@life-manager/shared/finance/food";
import { parseFormDateTime } from "@life-manager/shared/finance/summaries";
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

function parseGnvBar(value: FormDataEntryValue | null): GnvBar {
  const parsed = Number(value);
  if (!GNV_BARS.includes(parsed as GnvBar)) {
    throw new Error("Selecciona la barra GNV (1–5).");
  }
  return parsed as GnvBar;
}

function parseShiftId(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text || null;
}

async function getDriverJobId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: job } = await supabase.from("jobs").select("id").eq("code", "DRIVER").single();
  if (!job) {
    throw new Error("Job Chofer no configurado.");
  }
  return job.id;
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

  const paymentAccountId = parsePaymentAccountId(formData.get("payment_account_id"));

  const { error } = await supabase.from("finance_movements").insert({
    user_id: user.id,
    occurred_at: parseOccurredAt(formData),
    direction: "out",
    amount_soles: parseAmount(formData.get("amount_soles")),
    payment_method: parsePaymentMethod(formData.get("payment_method")),
    payment_account_id: paymentAccountId,
    source: "expense",
    category: parseCategory(formData.get("category")) ?? "otro",
    label,
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

export async function startDriverShift(formData: FormData) {
  const { supabase, user } = await requireUser();
  const jobId = await getDriverJobId(supabase);

  const workDate = String(formData.get("work_date") ?? "").trim();
  const shiftNumber = Number(formData.get("shift_number"));
  const startTime = String(formData.get("started_at_time") ?? "").trim();
  if (!workDate || !startTime || !Number.isFinite(shiftNumber)) {
    throw new Error("Completa fecha y hora de inicio.");
  }

  const breakMinutes = Number(formData.get("break_minutes") ?? 0);
  const startedAt = new Date(`${workDate}T${startTime}:00-05:00`).toISOString();

  const { error } = await supabase.from("driver_shifts").insert({
    user_id: user.id,
    job_id: jobId,
    work_date: workDate,
    shift_number: shiftNumber,
    started_at: startedAt,
    break_minutes: Number.isFinite(breakMinutes) ? Math.max(0, breakMinutes) : 0,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/driver");
}

export async function endDriverShift(formData: FormData) {
  const { supabase, user } = await requireUser();
  const shiftId = String(formData.get("shift_id") ?? "").trim();
  const endTime = String(formData.get("ended_at_time") ?? "").trim();
  if (!shiftId || !endTime) {
    throw new Error("Indica hora de cierre.");
  }

  const { data: shift } = await supabase
    .from("driver_shifts")
    .select("work_date")
    .eq("id", shiftId)
    .eq("user_id", user.id)
    .single();

  if (!shift) {
    throw new Error("Vuelta no encontrada.");
  }

  const breakMinutes = Number(formData.get("break_minutes") ?? 0);
  const endedAt = new Date(`${shift.work_date}T${endTime}:00-05:00`).toISOString();

  const { error } = await supabase
    .from("driver_shifts")
    .update({
      ended_at: endedAt,
      break_minutes: Number.isFinite(breakMinutes) ? Math.max(0, breakMinutes) : 0,
    })
    .eq("id", shiftId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/driver");
}

export async function logDriverIncome(formData: FormData) {
  const { supabase, user } = await requireUser();
  const paymentMethod = parsePaymentMethod(formData.get("payment_method"));
  if (!paymentMethod) {
    throw new Error("Indica Yape, Plin o efectivo.");
  }

  const jobId = await getDriverJobId(supabase);
  const gnvBar = parseGnvBar(formData.get("gnv_bar"));
  const amount = parseAmount(formData.get("amount_soles"));
  const label = `Carrera ${PAYMENT_METHOD_LABELS[paymentMethod]} · barra ${gnvBar}`;

  const { error } = await supabase.from("finance_movements").insert({
    user_id: user.id,
    occurred_at: parseOccurredAt(formData),
    direction: "in",
    amount_soles: amount,
    payment_method: paymentMethod,
    job_id: jobId,
    driver_shift_id: parseShiftId(formData.get("driver_shift_id")),
    gnv_bar: gnvBar,
    source: "driver_income",
    label,
    notes: String(formData.get("notes") ?? "").trim() || null,
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

  let label = String(formData.get("label") ?? "").trim();
  if (!label) {
    label =
      category === "app_saldo"
        ? "Recarga saldo app"
        : category === "combustible_gnv"
          ? "Recarga GNV"
          : EXPENSE_CATEGORY_LABELS[category];
  }

  const jobId = await getDriverJobId(supabase);

  const { error } = await supabase.from("finance_movements").insert({
    user_id: user.id,
    occurred_at: parseOccurredAt(formData),
    direction: "out",
    amount_soles: parseAmount(formData.get("amount_soles")),
    payment_method: parsePaymentMethod(formData.get("payment_method")),
    job_id: jobId,
    driver_shift_id: parseShiftId(formData.get("driver_shift_id")),
    source: "driver_expense",
    category,
    label,
    notes: String(formData.get("notes") ?? "").trim() || null,
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
      await supabase.from("user_account_balances").upsert({
        user_id: user.id,
        payment_account_id: inserted.id,
        balance_soles: 0,
      });
    }
  }

  revalidatePath("/finance");
  revalidatePath("/nutrition");
}
