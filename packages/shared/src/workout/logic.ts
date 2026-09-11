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
  sets: WorkoutSetView[];
};

export type CatalogExercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
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

export function countSetsInEntry(entry: Pick<WorkoutEntryView, "sets">): number {
  return new Set(entry.sets.map((set) => set.setNumber)).size;
}

export function sessionSetSummary(entries: WorkoutEntryView[]): {
  total: number;
  byMuscle: Array<{ muscleGroup: MuscleGroup; label: string; sets: number }>;
} {
  const byMuscle = groupByMuscle(entries).map((group) => ({
    muscleGroup: group.muscleGroup,
    label: group.label,
    sets: group.items.reduce((sum, entry) => sum + countSetsInEntry(entry), 0),
  }));
  return {
    total: byMuscle.reduce((sum, group) => sum + group.sets, 0),
    byMuscle,
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
