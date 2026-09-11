import { isMuscleGroup, isSpecialSetKind, type MuscleGroup, type SetKind } from "./constants";
import {
  moveEntryToPosition,
  nextSetNumber,
  nextSubsetNumber,
  setNumbersAfterDeletingSet,
  sortSets,
  type CatalogExercise,
  type WorkoutEntryView,
  type WorkoutSetView,
} from "./logic";

type QueryResult<T = unknown> = Promise<{ data: T; error: { message: string } | null }>;

type FilterBuilder = QueryResult & {
  eq: (column: string, value: string | number | boolean) => FilterBuilder;
  order: (column: string, options?: { ascending?: boolean }) => FilterBuilder;
  limit: (count: number) => FilterBuilder;
  maybeSingle: () => QueryResult<Record<string, unknown> | null>;
  single: () => QueryResult<Record<string, unknown> | null>;
};

type TableBuilder = {
  select: (columns: string) => FilterBuilder;
  insert: (values: Record<string, unknown> | Record<string, unknown>[]) => FilterBuilder & {
    select: (columns: string) => FilterBuilder;
  };
  update: (values: Record<string, unknown>) => FilterBuilder;
  delete: () => FilterBuilder;
};

type WorkoutDb = {
  from: (table: string) => TableBuilder;
};

function db(supabase: unknown): WorkoutDb {
  return supabase as WorkoutDb;
}

function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

function asMuscleGroup(value: unknown): MuscleGroup {
  return isMuscleGroup(String(value)) ? (value as MuscleGroup) : "otro";
}

function asMuscleGroups(raw: unknown, fallback: unknown): MuscleGroup[] {
  const listed = Array.isArray(raw) ? raw.map(asMuscleGroup) : [];
  const unique = [...new Set(listed.length > 0 ? listed : [asMuscleGroup(fallback)])];
  return unique.length > 0 ? unique : ["otro"];
}

function asSetKind(value: unknown): SetKind {
  return (value as SetKind) ?? "regular";
}

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapSet(row: Record<string, unknown>): WorkoutSetView {
  return {
    id: String(row.id),
    setNumber: Number(row.set_number),
    subsetNumber: Number(row.subset_number),
    setKind: asSetKind(row.set_kind),
    weightKg: asNumber(row.weight_kg),
    reps: asNumber(row.reps),
    rir: asNumber(row.rir),
  };
}

export async function listCatalogExercises(supabase: unknown): Promise<CatalogExercise[]> {
  const { data, error } = await db(supabase)
    .from("exercises")
    .select("id, name, muscle_group, muscle_groups")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) fail(error, "No se pudo cargar el catálogo.");

  return ((data as Record<string, unknown>[] | null) ?? []).map((row) => {
    const muscleGroups = asMuscleGroups(row.muscle_groups, row.muscle_group);
    return {
      id: String(row.id),
      name: String(row.name),
      muscleGroup: muscleGroups[0] ?? asMuscleGroup(row.muscle_group),
      muscleGroups,
    };
  });
}

export async function loadWorkoutDay(
  supabase: unknown,
  userId: string,
  sessionDate: string,
): Promise<WorkoutEntryView[]> {
  const { data: session, error: sessionError } = await db(supabase)
    .from("workout_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  if (sessionError) fail(sessionError, "No se pudo cargar el día.");
  if (!session?.id) return [];

  const { data, error } = await db(supabase)
    .from("workout_entries")
    .select("id, sort_order, exercise_id, exercises(name, muscle_group, muscle_groups), workout_sets(*)")
    .eq("session_id", String(session.id))
    .order("sort_order", { ascending: true });

  if (error) fail(error, "No se pudieron cargar los ejercicios.");

  return ((data as Record<string, unknown>[] | null) ?? []).map((row) => {
    const exercise = Array.isArray(row.exercises) ? row.exercises[0] : row.exercises;
    const exerciseRow = (exercise ?? {}) as Record<string, unknown>;
    const sets = ((row.workout_sets as Record<string, unknown>[] | null) ?? []).map(mapSet);
    const muscleGroups = asMuscleGroups(exerciseRow.muscle_groups, exerciseRow.muscle_group ?? "otro");
    return {
      id: String(row.id),
      sortOrder: Number(row.sort_order),
      exerciseId: String(row.exercise_id),
      exerciseName: String(exerciseRow.name ?? "Ejercicio"),
      muscleGroup: muscleGroups[0] ?? "otro",
      muscleGroups,
      sets: sortSets(sets),
    };
  });
}

async function ensureProfile(supabase: unknown, userId: string): Promise<void> {
  const existing = await db(supabase)
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing.error) fail(existing.error, "No se pudo leer el perfil.");
  if (existing.data?.id) return;

  const created = await db(supabase).from("profiles").insert({ id: userId });
  if (created.error) fail(created.error, "No se pudo crear el perfil.");
}

async function findSessionId(
  supabase: unknown,
  userId: string,
  sessionDate: string,
): Promise<string | null> {
  const existing = await db(supabase)
    .from("workout_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  if (existing.error) fail(existing.error, "No se pudo abrir la sesión.");
  return existing.data?.id ? String(existing.data.id) : null;
}

async function insertSession(
  supabase: unknown,
  userId: string,
  sessionDate: string,
): Promise<{ id: string | null; error: { message: string } | null }> {
  const created = await db(supabase)
    .from("workout_sessions")
    .insert({ user_id: userId, session_date: sessionDate })
    .select("id")
    .single();
  return {
    id: created.data?.id ? String(created.data.id) : null,
    error: created.error,
  };
}

async function ensureSession(
  supabase: unknown,
  userId: string,
  sessionDate: string,
): Promise<string> {
  const existingId = await findSessionId(supabase, userId, sessionDate);
  if (existingId) return existingId;

  const created = await insertSession(supabase, userId, sessionDate);
  if (created.id) return created.id;

  const message = created.error?.message ?? "";
  if (/foreign key|profiles/i.test(message)) {
    await ensureProfile(supabase, userId);
    const retried = await insertSession(supabase, userId, sessionDate);
    if (retried.id) return retried.id;
  }

  const raced = await findSessionId(supabase, userId, sessionDate);
  if (raced) return raced;
  fail(created.error, "No se pudo crear la sesión.");
}

async function loadEntrySets(supabase: unknown, entryId: string): Promise<WorkoutSetView[]> {
  const { data, error } = await db(supabase)
    .from("workout_sets")
    .select("id, set_number, subset_number, set_kind, weight_kg, reps, rir")
    .eq("entry_id", entryId)
    .order("set_number", { ascending: true });

  if (error) fail(error, "No se pudieron cargar los sets.");
  return sortSets(((data as Record<string, unknown>[] | null) ?? []).map(mapSet));
}

export async function addExerciseToDay(
  supabase: unknown,
  userId: string,
  sessionDate: string,
  exerciseId: string,
): Promise<void> {
  const sessionId = await ensureSession(supabase, userId, sessionDate);

  const last = await db(supabase)
    .from("workout_entries")
    .select("sort_order")
    .eq("session_id", sessionId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last.error) fail(last.error, "No se pudo leer el día.");

  const sortOrder = last.data?.sort_order == null ? 1 : Number(last.data.sort_order) + 1;
  const created = await db(supabase)
    .from("workout_entries")
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (created.error) {
    if (/duplicate|unique/i.test(created.error.message)) return;
    fail(created.error, "No se pudo agregar el ejercicio.");
  }
  if (!created.data?.id) fail(created.error, "No se pudo agregar el ejercicio.");

  const firstSet = await db(supabase).from("workout_sets").insert({
    entry_id: String(created.data.id),
    set_number: 1,
    subset_number: 1,
    set_kind: "regular",
  });

  if (firstSet.error) fail(firstSet.error, "No se pudo crear el set.");
}

export async function createAndAddExercise(
  supabase: unknown,
  userId: string,
  sessionDate: string,
  name: string,
  muscleGroupsInput: MuscleGroup[] | MuscleGroup,
): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Escribe el nombre del ejercicio.");
  }
  const muscleGroups = asMuscleGroups(
    Array.isArray(muscleGroupsInput) ? muscleGroupsInput : [muscleGroupsInput],
    "otro",
  );

  const created = await db(supabase)
    .from("exercises")
    .insert({
      user_id: userId,
      name: trimmed,
      muscle_group: muscleGroups[0],
      muscle_groups: muscleGroups,
    })
    .select("id")
    .single();

  if (created.error || !created.data?.id) {
    fail(created.error, "No se pudo crear el ejercicio.");
  }

  await addExerciseToDay(supabase, userId, sessionDate, String(created.data.id));
}

export async function addSet(supabase: unknown, entryId: string): Promise<void> {
  const sets = await loadEntrySets(supabase, entryId);
  const last = sets[sets.length - 1];
  const inserted = await db(supabase).from("workout_sets").insert({
    entry_id: entryId,
    set_number: nextSetNumber(sets),
    subset_number: 1,
    set_kind: "regular",
    weight_kg: last?.weightKg,
    reps: last?.reps,
    rir: last?.rir,
  });
  if (inserted.error) fail(inserted.error, "No se pudo agregar el set.");
}

export async function addSubset(supabase: unknown, entryId: string, setNumber: number): Promise<void> {
  const sets = await loadEntrySets(supabase, entryId);
  const siblings = sets.filter((set) => set.setNumber === setNumber);
  if (siblings.length === 0) {
    throw new Error("Set no encontrado.");
  }
  const kind = siblings[0].setKind;
  if (!isSpecialSetKind(kind)) {
    throw new Error("Solo myorep, drop set o cluster tienen sub sets.");
  }

  const inserted = await db(supabase).from("workout_sets").insert({
    entry_id: entryId,
    set_number: setNumber,
    subset_number: nextSubsetNumber(sets, setNumber),
    set_kind: kind,
  });
  if (inserted.error) fail(inserted.error, "No se pudo agregar el sub set.");
}

export async function updateSetFields(
  supabase: unknown,
  setId: string,
  fields: { weightKg?: number | null; reps?: number | null; rir?: number | null },
): Promise<void> {
  const payload: Record<string, number | null> = {};
  if ("weightKg" in fields) payload.weight_kg = fields.weightKg ?? null;
  if ("reps" in fields) payload.reps = fields.reps ?? null;
  if ("rir" in fields) payload.rir = fields.rir ?? null;

  const updated = await db(supabase).from("workout_sets").update(payload).eq("id", setId);
  if (updated.error) fail(updated.error, "No se pudo guardar el set.");
}

export async function changeSetKind(
  supabase: unknown,
  entryId: string,
  setNumber: number,
  nextKind: SetKind,
): Promise<void> {
  const sets = await loadEntrySets(supabase, entryId);
  const siblings = sets.filter((set) => set.setNumber === setNumber);
  if (siblings.length === 0) {
    throw new Error("Set no encontrado.");
  }

  const updated = await db(supabase)
    .from("workout_sets")
    .update({ set_kind: nextKind })
    .eq("entry_id", entryId)
    .eq("set_number", setNumber);

  if (updated.error) fail(updated.error, "No se pudo cambiar el tipo de set.");

  if (isSpecialSetKind(nextKind) && siblings.length === 1) {
    const opened = await db(supabase).from("workout_sets").insert({
      entry_id: entryId,
      set_number: setNumber,
      subset_number: 2,
      set_kind: nextKind,
    });
    if (opened.error) fail(opened.error, "No se pudo abrir el sub set.");
    return;
  }

  if (nextKind === "regular") {
    const extras = siblings.filter((set) => set.subsetNumber > 1);
    for (const extra of extras) {
      const removed = await db(supabase).from("workout_sets").delete().eq("id", extra.id);
      if (removed.error) fail(removed.error, "No se pudo quitar el sub set.");
    }
    const reset = await db(supabase)
      .from("workout_sets")
      .update({ subset_number: 1, set_kind: "regular" })
      .eq("entry_id", entryId)
      .eq("set_number", setNumber);
    if (reset.error) fail(reset.error, "No se pudo volver a regular.");
  }
}

export async function deleteSetRow(supabase: unknown, setId: string): Promise<void> {
  const { data, error } = await db(supabase)
    .from("workout_sets")
    .select("id, entry_id, set_number, subset_number")
    .eq("id", setId)
    .single();

  if (error || !data) fail(error, "Set no encontrado.");

  const entryId = String(data.entry_id);
  const setNumber = Number(data.set_number);
  const sets = await loadEntrySets(supabase, entryId);
  const siblings = sets.filter((set) => set.setNumber === setNumber);

  const removed = await db(supabase).from("workout_sets").delete().eq("id", setId);
  if (removed.error) fail(removed.error, "No se pudo borrar el set.");

  const shifts = setNumbersAfterDeletingSet(sets, setId, setNumber, siblings.length);
  for (const shift of shifts) {
    const renumbered = await db(supabase)
      .from("workout_sets")
      .update({ set_number: shift.setNumber })
      .eq("id", shift.id);
    if (renumbered.error) fail(renumbered.error, "No se pudo reordenar.");
  }
}

async function writeEntryOrder(
  supabase: unknown,
  rows: Array<{ id: string; sortOrder: number }>,
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    const temp = await db(supabase)
      .from("workout_entries")
      .update({ sort_order: -(index + 1) })
      .eq("id", row.id);
    if (temp.error) fail(temp.error, "No se pudo reordenar.");
  }
  for (const row of rows) {
    const saved = await db(supabase)
      .from("workout_entries")
      .update({ sort_order: row.sortOrder })
      .eq("id", row.id);
    if (saved.error) fail(saved.error, "No se pudo reordenar.");
  }
}

export async function reorderDayEntry(
  supabase: unknown,
  entryId: string,
  position: number,
): Promise<void> {
  const current = await db(supabase)
    .from("workout_entries")
    .select("id, session_id")
    .eq("id", entryId)
    .single();
  if (current.error || !current.data?.session_id) fail(current.error, "Ejercicio no encontrado.");

  const siblings = await db(supabase)
    .from("workout_entries")
    .select("id, sort_order")
    .eq("session_id", String(current.data.session_id))
    .order("sort_order", { ascending: true });
  if (siblings.error) fail(siblings.error, "No se pudo leer el orden.");

  const asEntries = ((siblings.data as Record<string, unknown>[] | null) ?? []).map((row) => ({
    id: String(row.id),
    sortOrder: Number(row.sort_order),
    exerciseId: "",
    exerciseName: "",
    muscleGroup: "otro" as const,
    muscleGroups: ["otro" as const],
    sets: [],
  }));
  const next = moveEntryToPosition(asEntries, entryId, position);
  await writeEntryOrder(
    supabase,
    next.map((entry) => ({ id: entry.id, sortOrder: entry.sortOrder })),
  );
}

export async function deleteEntry(supabase: unknown, entryId: string): Promise<void> {
  const current = await db(supabase)
    .from("workout_entries")
    .select("id, session_id")
    .eq("id", entryId)
    .single();
  if (current.error || !current.data?.session_id) fail(current.error, "No se pudo quitar el ejercicio.");

  const removed = await db(supabase).from("workout_entries").delete().eq("id", entryId);
  if (removed.error) fail(removed.error, "No se pudo quitar el ejercicio.");

  const siblings = await db(supabase)
    .from("workout_entries")
    .select("id, sort_order")
    .eq("session_id", String(current.data.session_id))
    .order("sort_order", { ascending: true });
  if (siblings.error) fail(siblings.error, "No se pudo reordenar.");

  const remaining = ((siblings.data as Record<string, unknown>[] | null) ?? []).map((row, index) => ({
    id: String(row.id),
    sortOrder: index + 1,
  }));
  if (remaining.length > 0) {
    await writeEntryOrder(supabase, remaining);
  }
}
