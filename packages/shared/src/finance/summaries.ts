import type { PaymentMethod } from "@life-manager/shared/finance/constants";

export const LIMA_TZ = "America/Lima";

export function todayInLima(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: LIMA_TZ }).format(new Date());
}

export function dayRangeInLima(dateYmd: string): { start: string; end: string } {
  const start = new Date(`${dateYmd}T00:00:00-05:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatTimeLima(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function formatDateLima(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function parseFormDateTime(
  date: FormDataEntryValue | null,
  time: FormDataEntryValue | null,
): string {
  const dateStr = String(date ?? "").trim();
  const timeStr = String(time ?? "").trim();
  if (dateStr && timeStr) {
    return new Date(`${dateStr}T${timeStr}:00-05:00`).toISOString();
  }
  if (dateStr) {
    return new Date(`${dateStr}T12:00:00-05:00`).toISOString();
  }
  return new Date().toISOString();
}

export function nowTimeInLima(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LIMA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/** Día elegido en la UI + hora actual al guardar (Lima). */
export function occurredAtForWorkDate(workDateYmd: string, at: Date = new Date()): string {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: LIMA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(at);
  return new Date(`${workDateYmd}T${time}:00-05:00`).toISOString();
}

export type MovementRow = {
  id: string;
  occurred_at: string;
  direction: "in" | "out";
  amount_soles: number;
  kcal: number | null;
  label: string;
  payment_method: PaymentMethod | null;
  source: string;
  category: string | null;
  gnv_bar?: number | null;
  driver_shift_id?: string | null;
};

export function sumKcalToday(movements: MovementRow[]): number {
  return movements.reduce((total, row) => total + (row.kcal ?? 0), 0);
}

export function sumExpensesToday(movements: MovementRow[]): number {
  return movements
    .filter((row) => row.direction === "out")
    .reduce((total, row) => total + Number(row.amount_soles), 0);
}

export function sumIncomeToday(movements: MovementRow[]): number {
  return movements
    .filter((row) => row.direction === "in")
    .reduce((total, row) => total + Number(row.amount_soles), 0);
}

export function sumIncomeByPayment(movements: MovementRow[]): Record<PaymentMethod, number> {
  const base: Record<PaymentMethod, number> = {
    yape: 0,
    plin: 0,
    efectivo: 0,
    otro: 0,
  };

  for (const row of movements) {
    if (row.direction !== "in" || !row.payment_method) {
      continue;
    }
    base[row.payment_method] += Number(row.amount_soles);
  }

  return base;
}

export function sumByGnvBar(movements: MovementRow[]): Record<number, number> {
  const bars: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of movements) {
    if (row.direction === "in" && row.gnv_bar != null) {
      bars[row.gnv_bar] += Number(row.amount_soles);
    }
  }
  return bars;
}

export type DriverShiftRow = {
  id: string;
  shift_number: number;
  started_at: string;
  ended_at: string | null;
  break_minutes: number;
  notes: string | null;
};

export function shiftWorkedMinutes(shift: DriverShiftRow): number {
  if (!shift.ended_at) {
    return 0;
  }
  const ms =
    new Date(shift.ended_at).getTime() - new Date(shift.started_at).getTime();
  return Math.max(0, Math.round(ms / 60000) - shift.break_minutes);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) {
    return `${m} min`;
  }
  return `${h}h ${m}m`;
}

export function hourlyRate(netSoles: number, workedMinutes: number): number | null {
  if (workedMinutes <= 0) {
    return null;
  }
  return Math.round((netSoles / (workedMinutes / 60)) * 100) / 100;
}

export function movementsForShift(
  movements: MovementRow[],
  shiftId: string,
): MovementRow[] {
  return movements.filter((row) => row.driver_shift_id === shiftId);
}
