export const MUSCLE_GROUPS = [
  "pecho",
  "espalda",
  "hombros",
  "biceps",
  "triceps",
  "cuadriceps",
  "isquiotibiales",
  "gluteos",
  "pantorrillas",
  "core",
  "antebrazos",
  "cardio",
  "otro",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  pecho: "#e11d48",
  espalda: "#2563eb",
  hombros: "#d97706",
  biceps: "#7c3aed",
  triceps: "#0f766e",
  cuadriceps: "#db2777",
  isquiotibiales: "#4f46e5",
  gluteos: "#c026d3",
  pantorrillas: "#65a30d",
  core: "#ea580c",
  antebrazos: "#78716c",
  cardio: "#0891b2",
  otro: "#6b7280",
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  pecho: "Pecho",
  espalda: "Espalda",
  hombros: "Hombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  cuadriceps: "Cuádriceps",
  isquiotibiales: "Isquiotibiales",
  gluteos: "Glúteos",
  pantorrillas: "Pantorrillas",
  core: "Core",
  antebrazos: "Antebrazos",
  cardio: "Cardio",
  otro: "Otro",
};

export const SET_KINDS = ["regular", "myorep", "drop_set", "cluster"] as const;

export type SetKind = (typeof SET_KINDS)[number];

export const SET_KIND_LABELS: Record<SetKind, string> = {
  regular: "Regular",
  myorep: "Myorep",
  drop_set: "Drop set",
  cluster: "Cluster",
};

export const SPECIAL_SET_KINDS = ["myorep", "drop_set", "cluster"] as const;

export type SpecialSetKind = (typeof SPECIAL_SET_KINDS)[number];

export function isSetKind(value: string): value is SetKind {
  return SET_KINDS.includes(value as SetKind);
}

export function isMuscleGroup(value: string): value is MuscleGroup {
  return MUSCLE_GROUPS.includes(value as MuscleGroup);
}

export function isSpecialSetKind(kind: SetKind): kind is SpecialSetKind {
  return SPECIAL_SET_KINDS.includes(kind as SpecialSetKind);
}

export function todayInLima(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
}

export function shiftDate(dateYmd: string, days: number): string {
  const [year, month, day] = dateYmd.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}
