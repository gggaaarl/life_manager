import {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_LABELS,
  isSpecialSetKind,
  type MuscleGroup,
  type SetKind,
} from "./constants";

export type WorkoutSetView = {
  id: string;
  setNumber: number;
  subsetNumber: number;
  setKind: SetKind;
  weightKg: number | null;
  reps: number | null;
  rir: number | null;
};

export type WorkoutEntryView = {
  id: string;
  sortOrder: number;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  muscleGroups: MuscleGroup[];
  sets: WorkoutSetView[];
};

export type WorkoutSessionView = {
  id: string;
  sessionNumber: number;
  entries: WorkoutEntryView[];
};

export type WorkoutDayView = {
  date: string;
  sessions: WorkoutSessionView[];
};

export type CatalogExercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  muscleGroups: MuscleGroup[];
};

export type MuscleExerciseGroup<T> = {
  muscleGroup: MuscleGroup;
  label: string;
  items: T[];
};

export function sortSets(sets: WorkoutSetView[]): WorkoutSetView[] {
  return [...sets].sort((a, b) => {
    if (a.setNumber !== b.setNumber) return a.setNumber - b.setNumber;
    return a.subsetNumber - b.subsetNumber;
  });
}

export function subsetCount(sets: WorkoutSetView[], setNumber: number): number {
  return sets.filter((set) => set.setNumber === setNumber).length;
}

export function showsSubsetLabel(sets: WorkoutSetView[], set: WorkoutSetView): boolean {
  return isSpecialSetKind(set.setKind) || subsetCount(sets, set.setNumber) > 1;
}

export function formatSetLabel(sets: WorkoutSetView[], set: WorkoutSetView): string {
  if (showsSubsetLabel(sets, set)) {
    return `${set.setNumber}.${set.subsetNumber}`;
  }
  return String(set.setNumber);
}

export function nextSetNumber(sets: WorkoutSetView[]): number {
  return sets.reduce((max, set) => Math.max(max, set.setNumber), 0) + 1;
}

/** Al borrar un set entero, los que siguen bajan 1. Los subsets del mismo número no se tocan. */
export function setNumbersAfterDeletingSet(
  sets: WorkoutSetView[],
  deletedId: string,
  deletedSetNumber: number,
  siblingCount: number,
): Array<{ id: string; setNumber: number }> {
  if (siblingCount > 1) return [];
  return sets
    .filter((set) => set.id !== deletedId && set.setNumber > deletedSetNumber)
    .sort((a, b) => a.setNumber - b.setNumber || a.subsetNumber - b.subsetNumber)
    .map((set) => ({ id: set.id, setNumber: set.setNumber - 1 }));
}

export function nextSubsetNumber(sets: WorkoutSetView[], setNumber: number): number {
  return (
    sets
      .filter((set) => set.setNumber === setNumber)
      .reduce((max, set) => Math.max(max, set.subsetNumber), 0) + 1
  );
}

export function lastSetOfKind(sets: WorkoutSetView[]): WorkoutSetView | null {
  const ordered = sortSets(sets);
  return ordered[ordered.length - 1] ?? null;
}

function hasLoggedWork(set: WorkoutSetView): boolean {
  return set.weightKg != null && set.reps != null && set.rir != null;
}

/** Set numerado con peso, reps y RIR. 4.1 y 4.2 cuentan como uno. Vacío no cuenta. */
export function countSetsInEntry(entry: Pick<WorkoutEntryView, "sets">): number {
  const counted = new Set<number>();
  for (const set of entry.sets) {
    if (!Number.isFinite(set.setNumber) || !hasLoggedWork(set)) continue;
    counted.add(set.setNumber);
  }
  return counted.size;
}

export function exerciseMuscles(item: {
  muscleGroup: MuscleGroup;
  muscleGroups?: MuscleGroup[];
}): MuscleGroup[] {
  const listed = item.muscleGroups?.length ? item.muscleGroups : [item.muscleGroup];
  return MUSCLE_GROUPS.filter((group) => listed.includes(group));
}

export function orderedEntries(entries: WorkoutEntryView[]): WorkoutEntryView[] {
  return [...entries].sort((a, b) => a.sortOrder - b.sortOrder || a.exerciseName.localeCompare(b.exerciseName));
}

export function moveEntryToPosition(
  entries: WorkoutEntryView[],
  entryId: string,
  position: number,
): WorkoutEntryView[] {
  const ordered = orderedEntries(entries);
  const from = ordered.findIndex((entry) => entry.id === entryId);
  if (from < 0) return ordered;
  const to = Math.max(0, Math.min(ordered.length - 1, Math.trunc(position) - 1));
  const next = [...ordered];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next.map((entry, index) => ({ ...entry, sortOrder: index + 1 }));
}

export function applySetFields(
  entries: WorkoutEntryView[],
  setId: string,
  fields: { weightKg?: number | null; reps?: number | null; rir?: number | null },
): WorkoutEntryView[] {
  return entries.map((entry) => ({
    ...entry,
    sets: entry.sets.map((set) => (set.id === setId ? { ...set, ...fields } : set)),
  }));
}

export function applySetFieldsToDay(
  day: WorkoutDayView,
  setId: string,
  fields: { weightKg?: number | null; reps?: number | null; rir?: number | null },
): WorkoutDayView {
  return {
    ...day,
    sessions: day.sessions.map((session) => ({
      ...session,
      entries: applySetFields(session.entries, setId, fields),
    })),
  };
}

export function moveEntryInDay(
  day: WorkoutDayView,
  entryId: string,
  position: number,
): WorkoutDayView {
  return {
    ...day,
    sessions: day.sessions.map((session) => ({
      ...session,
      entries: moveEntryToPosition(session.entries, entryId, position),
    })),
  };
}

export function defaultSessionLabel(sessionNumber: number): string {
  return `Sesión ${sessionNumber}`;
}

export function daySetSummary(day: WorkoutDayView): {
  total: number;
  byMuscle: Array<{ muscleGroup: MuscleGroup; label: string; sets: number }>;
} {
  const allEntries = day.sessions.flatMap((session) => session.entries);
  return sessionSetSummary(allEntries);
}

export function sessionSetSummary(entries: WorkoutEntryView[]): {
  total: number;
  byMuscle: Array<{ muscleGroup: MuscleGroup; label: string; sets: number }>;
} {
  const totals = new Map<MuscleGroup, number>();
  let total = 0;
  for (const entry of entries) {
    const sets = countSetsInEntry(entry);
    total += sets;
    for (const muscle of exerciseMuscles(entry)) {
      totals.set(muscle, (totals.get(muscle) ?? 0) + sets);
    }
  }
  return {
    total,
    byMuscle: MUSCLE_GROUPS.flatMap((muscleGroup) => {
      const sets = totals.get(muscleGroup);
      if (!sets) return [];
      return [{ muscleGroup, label: MUSCLE_GROUP_LABELS[muscleGroup], sets }];
    }),
  };
}

export function groupByMuscle<T extends { muscleGroup: MuscleGroup }>(
  items: T[],
): MuscleExerciseGroup<T>[] {
  return MUSCLE_GROUPS.flatMap((muscleGroup) => {
    const groupItems = items.filter((item) => item.muscleGroup === muscleGroup);
    if (groupItems.length === 0) return [];
    return [
      {
        muscleGroup,
        label: MUSCLE_GROUP_LABELS[muscleGroup],
        items: groupItems,
      },
    ];
  });
}

export function parseOptionalNumber(value: string): number | null {
  const text = value.trim().replace(",", ".");
  if (!text) return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) {
    throw new Error("Número inválido.");
  }
  return parsed;
}

export function parseOptionalInt(value: string): number | null {
  const parsed = parseOptionalNumber(value);
  if (parsed == null) return null;
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("Reps inválidas.");
  }
  return parsed;
}

export function parseOptionalRir(value: string): number | null {
  const parsed = parseOptionalNumber(value);
  if (parsed == null) return null;
  if (parsed < 0 || parsed > 10) {
    throw new Error("RIR debe estar entre 0 y 10.");
  }
  return parsed;
}

export function numberToInput(value: number | null): string {
  return value == null ? "" : String(value);
}
