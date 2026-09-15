export const MUSCLE_GROUPS = [
  "pecho",
  "espalda",
  "deltoide_anterior",
  "deltoide_lateral",
  "deltoide_posterior",
  "triceps",
  "biceps",
  "antebrazos",
  "core",
  "cuadriceps",
  "isquiotibiales",
  "gluteos",
  "pantorrillas",
  "cardio",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const DEFAULT_MUSCLE_GROUP: MuscleGroup = "pecho";

/** IDs en public.muscle_groups — se guardan en exercises.muscle_group_ids (smallint[]). */
export const MUSCLE_GROUP_IDS: Record<MuscleGroup, number> = {
  pecho: 1,
  espalda: 2,
  deltoide_anterior: 3,
  deltoide_lateral: 4,
  deltoide_posterior: 5,
  triceps: 6,
  biceps: 7,
  antebrazos: 8,
  core: 9,
  cuadriceps: 10,
  isquiotibiales: 11,
  gluteos: 12,
  pantorrillas: 13,
  cardio: 14,
};

const MUSCLE_ID_TO_GROUP = Object.fromEntries(
  Object.entries(MUSCLE_GROUP_IDS).map(([group, id]) => [id, group]),
) as Record<number, MuscleGroup>;

export function muscleGroupFromId(id: number): MuscleGroup {
  return MUSCLE_ID_TO_GROUP[id] ?? DEFAULT_MUSCLE_GROUP;
}

export function muscleGroupIds(groups: MuscleGroup[]): number[] {
  const unique = [...new Set(groups.length > 0 ? groups : [DEFAULT_MUSCLE_GROUP])];
  return unique.map((group) => MUSCLE_GROUP_IDS[group]);
}

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  pecho: "#e11d48",
  espalda: "#2563eb",
  deltoide_anterior: "#f59e0b",
  deltoide_lateral: "#d97706",
  deltoide_posterior: "#b45309",
  triceps: "#0f766e",
  biceps: "#7c3aed",
  antebrazos: "#78716c",
  core: "#ea580c",
  cuadriceps: "#db2777",
  isquiotibiales: "#4f46e5",
  gluteos: "#c026d3",
  pantorrillas: "#65a30d",
  cardio: "#0891b2",
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  pecho: "Pecho",
  espalda: "Espalda",
  deltoide_anterior: "Deltoide anterior",
  deltoide_lateral: "Deltoide lateral",
  deltoide_posterior: "Deltoide posterior",
  triceps: "Tríceps",
  biceps: "Bíceps",
  antebrazos: "Antebrazos",
  core: "Core",
  cuadriceps: "Cuádriceps",
  isquiotibiales: "Isquiotibiales",
  gluteos: "Glúteos",
  pantorrillas: "Pantorrillas",
  cardio: "Cardio",
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
