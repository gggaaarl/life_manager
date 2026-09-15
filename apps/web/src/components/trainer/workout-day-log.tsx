"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  addExerciseToSession,
  addSet,
  addSubset,
  changeSetKind,
  createAndAddExercise,
  createWorkoutSession,
  deleteEntry,
  deleteSetRow,
  updateSetFields,
} from "@life-manager/shared/workout/api";
import {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_COLORS,
  MUSCLE_GROUP_LABELS,
  SET_KINDS,
  SET_KIND_LABELS,
  isSetKind,
  isSpecialSetKind,
  type MuscleGroup,
} from "@life-manager/shared/workout/constants";
import {
  daySetSummary,
  defaultSessionLabel,
  exerciseMuscles,
  formatSetLabel,
  groupByMuscle,
  numberToInput,
  orderedEntries,
  sessionSetSummary,
  parseOptionalInt,
  parseOptionalNumber,
  parseOptionalRir,
  type CatalogExercise,
  type WorkoutDayView,
  type WorkoutEntryView,
  type WorkoutSessionView,
} from "@life-manager/shared/workout/logic";

type Props = {
  date: string;
  userId: string;
  catalog: CatalogExercise[];
  day: WorkoutDayView;
  onRefreshDay: () => Promise<unknown>;
  onRefreshCatalog: () => Promise<unknown>;
  onSetFieldsChange: (
    setId: string,
    fields: { weightKg?: number | null; reps?: number | null; rir?: number | null },
  ) => void;
  onReorderEntry: (entryId: string, position: number) => Promise<void> | void;
};

const cellInput =
  "h-9 w-full min-w-0 rounded-md border-0 bg-transparent px-1 text-center text-[15px] tabular-nums text-ink outline-none placeholder:text-muted/50 focus:bg-sand";

const tableGrid =
  "grid grid-cols-[2.25rem_minmax(3.25rem,1fr)_minmax(3.25rem,1fr)_minmax(2.75rem,0.85fr)_minmax(5.75rem,7rem)_1.5rem] items-center gap-x-1";

function MuscleBadges({
  item,
}: {
  item: { muscleGroup: MuscleGroup; muscleGroups?: MuscleGroup[] };
}) {
  return (
    <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
      {exerciseMuscles(item).map((group) => (
        <span
          key={group}
          className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
          style={{ backgroundColor: MUSCLE_GROUP_COLORS[group] }}
        >
          {MUSCLE_GROUP_LABELS[group]}
        </span>
      ))}
    </span>
  );
}

function SummaryBlock({
  title,
  summary,
}: {
  title: string;
  summary: ReturnType<typeof sessionSetSummary>;
}) {
  return (
    <div>
      <p className="text-[15px] font-semibold text-ink">
        {title}: {summary.total}
      </p>
      {summary.byMuscle.length > 0 ? (
        <p className="mt-1 text-[13px] text-muted">
          {summary.byMuscle.map((group) => `${group.label} ${group.sets}`).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

export function WorkoutDayLog({
  date,
  userId,
  catalog,
  day,
  onRefreshDay,
  onRefreshCatalog,
  onSetFieldsChange,
  onReorderEntry,
}: Props) {
  const [, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);
  const [pickerSessionId, setPickerSessionId] = useState<string | null>(null);
  const daySummary = daySetSummary(day);
  const hasSessions = day.sessions.length > 0;

  return (
    <div className="pb-24">
      {hasSessions ? (
        <div className="mb-8">
          <SummaryBlock title="Volumen sistemático del día" summary={daySummary} />
        </div>
      ) : (
        <p className="py-8 text-center text-[15px] text-muted">
          Todavía no hay sesiones en este día.
        </p>
      )}

      <div className="space-y-10">
        {day.sessions.map((session) => (
          <WorkoutSessionBlock
            key={session.id}
            session={session}
            onRefreshDay={onRefreshDay}
            onSetFieldsChange={onSetFieldsChange}
            onReorderEntry={onReorderEntry}
            onAddExercise={() => setPickerSessionId(session.id)}
          />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button
          type="button"
          onClick={() => {
            startTransition(async () => {
              await createWorkoutSession(supabase, userId, date);
              await onRefreshDay();
            });
          }}
          className="mx-auto block w-full max-w-md rounded-full border border-line py-3.5 text-[15px] font-semibold text-ink sm:w-auto sm:px-8"
        >
          + Agregar sesión
        </button>
      </div>

      {pickerSessionId ? (
        <AddExercisePicker
          userId={userId}
          sessionId={pickerSessionId}
          catalog={catalog}
          usedIds={
            new Set(
              day.sessions
                .find((session) => session.id === pickerSessionId)
                ?.entries.map((entry) => entry.exerciseId) ?? [],
            )
          }
          onClose={() => setPickerSessionId(null)}
          onRefreshDay={onRefreshDay}
          onRefreshCatalog={onRefreshCatalog}
        />
      ) : null}
    </div>
  );
}

function WorkoutSessionBlock({
  session,
  onRefreshDay,
  onSetFieldsChange,
  onReorderEntry,
  onAddExercise,
}: {
  session: WorkoutSessionView;
  onRefreshDay: () => Promise<unknown>;
  onSetFieldsChange: Props["onSetFieldsChange"];
  onReorderEntry: Props["onReorderEntry"];
  onAddExercise: () => void;
}) {
  const listed = orderedEntries(session.entries);
  const sessionSummary = sessionSetSummary(session.entries);

  return (
    <section className="rounded-2xl border border-line p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold tracking-tight text-ink">
            {defaultSessionLabel(session.sessionNumber)}
          </h2>
          <SummaryBlock title="Volumen de la sesión" summary={sessionSummary} />
        </div>
        <button
          type="button"
          onClick={onAddExercise}
          className="rounded-full bg-teal px-4 py-2 text-[14px] font-semibold text-white"
        >
          Agregar ejercicio
        </button>
      </div>

      {listed.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-muted">Sin ejercicios en esta sesión.</p>
      ) : (
        <div className="space-y-7">
          {listed.map((entry, index) => (
            <ExerciseBlock
              key={entry.id}
              entry={entry}
              number={index + 1}
              onRefreshDay={onRefreshDay}
              onSetFieldsChange={onSetFieldsChange}
              onReorderEntry={onReorderEntry}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ExerciseBlock({
  entry,
  number,
  onRefreshDay,
  onSetFieldsChange,
  onReorderEntry,
}: {
  entry: WorkoutEntryView;
  number: number;
  onRefreshDay: () => Promise<unknown>;
  onSetFieldsChange: Props["onSetFieldsChange"];
  onReorderEntry: Props["onReorderEntry"];
}) {
  const [, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);

  return (
    <article>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="flex min-w-0 items-center text-[16px] font-semibold tracking-tight text-ink">
          <input
            key={number}
            type="text"
            inputMode="numeric"
            defaultValue={String(number)}
            aria-label="Orden"
            className="mr-2 h-8 w-8 rounded-md border-0 bg-sand text-center text-[15px] font-medium tabular-nums text-ink outline-none focus:ring-1 focus:ring-teal/30"
            onBlur={(event) => {
              const next = Number.parseInt(event.currentTarget.value, 10);
              if (!Number.isInteger(next) || next === number) {
                event.currentTarget.value = String(number);
                return;
              }
              void onReorderEntry(entry.id, next);
            }}
          />
          <span className="min-w-0">
            {entry.exerciseName}
            <MuscleBadges item={entry} />
          </span>
        </h3>
        <button
          type="button"
          className="text-[13px] text-muted hover:text-ink"
          onClick={() => {
            startTransition(async () => {
              await deleteEntry(supabase, entry.id);
              await onRefreshDay();
            });
          }}
        >
          Quitar
        </button>
      </div>

      <div className={`${tableGrid} border-b border-line pb-1.5 text-[11px] font-medium text-muted`}>
        <span>Set</span>
        <span className="text-center">kg</span>
        <span className="text-center">Reps</span>
        <span className="text-center">RIR</span>
        <span className="text-center">Tipo</span>
        <span />
      </div>

      {entry.sets.map((set) => (
        <SetRow
          key={set.id}
          entryId={entry.id}
          sets={entry.sets}
          set={set}
          onRefreshDay={onRefreshDay}
          onSetFieldsChange={onSetFieldsChange}
        />
      ))}

      <button
        type="button"
        className="mt-1 w-full py-2.5 text-center text-[14px] font-medium text-teal"
        onClick={() => {
          startTransition(async () => {
            await addSet(supabase, entry.id);
            await onRefreshDay();
          });
        }}
      >
        + Agregar set
      </button>
    </article>
  );
}

function SetRow({
  entryId,
  sets,
  set,
  onRefreshDay,
  onSetFieldsChange,
}: {
  entryId: string;
  sets: WorkoutEntryView["sets"];
  set: WorkoutEntryView["sets"][number];
  onRefreshDay: () => Promise<unknown>;
  onSetFieldsChange: Props["onSetFieldsChange"];
}) {
  const [, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);
  const special = isSpecialSetKind(set.setKind);
  const isLastSubset =
    special &&
    set.subsetNumber ===
      Math.max(...sets.filter((row) => row.setNumber === set.setNumber).map((row) => row.subsetNumber));

  function readFields(form: HTMLFormElement) {
    const data = new FormData(form);
    return {
      weightKg: parseOptionalNumber(String(data.get("weightKg") ?? "")),
      reps: parseOptionalInt(String(data.get("reps") ?? "")),
      rir: parseOptionalRir(String(data.get("rir") ?? "")),
    };
  }

  function saveFields(form: HTMLFormElement) {
    try {
      const fields = readFields(form);
      onSetFieldsChange(set.id, fields);
      startTransition(async () => {
        await updateSetFields(supabase, set.id, fields);
      });
    } catch {
      return;
    }
  }

  return (
    <div className="border-b border-line">
      <form
        className={`${tableGrid} py-1`}
        onInput={(event) => {
          try {
            onSetFieldsChange(set.id, readFields(event.currentTarget));
          } catch {
            return;
          }
        }}
        onBlur={(event) => {
          const next = event.relatedTarget as Node | null;
          if (next && event.currentTarget.contains(next)) return;
          saveFields(event.currentTarget);
        }}
      >
        <span className="pl-1 text-[15px] font-medium tabular-nums text-ink">
          {formatSetLabel(sets, set)}
        </span>
        <input
          name="weightKg"
          inputMode="decimal"
          defaultValue={numberToInput(set.weightKg)}
          placeholder="—"
          aria-label="Peso"
          className={cellInput}
        />
        <input
          name="reps"
          inputMode="numeric"
          defaultValue={numberToInput(set.reps)}
          placeholder="—"
          aria-label="Reps"
          className={cellInput}
        />
        <input
          name="rir"
          inputMode="decimal"
          defaultValue={numberToInput(set.rir)}
          placeholder="—"
          aria-label="RIR"
          className={cellInput}
        />
        <select
          name="setKind"
          defaultValue={set.setKind}
          aria-label="Tipo de set"
          className="h-9 w-full rounded-md border-0 bg-transparent px-1 text-center text-[13px] text-ink outline-none focus:bg-sand"
          onChange={(event) => {
            const nextKind = event.target.value;
            if (!isSetKind(nextKind)) return;
            startTransition(async () => {
              await changeSetKind(supabase, entryId, set.setNumber, nextKind);
              await onRefreshDay();
            });
          }}
        >
          {SET_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {SET_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label="Borrar set"
          className="text-[13px] text-muted hover:text-ink"
          onClick={() => {
            startTransition(async () => {
              await deleteSetRow(supabase, set.id);
              await onRefreshDay();
            });
          }}
        >
          ✕
        </button>
      </form>

      {isLastSubset ? (
        <button
          type="button"
          className="w-full py-2 text-center text-[13px] font-medium text-teal"
          onClick={() => {
            startTransition(async () => {
              await addSubset(supabase, entryId, set.setNumber);
              await onRefreshDay();
            });
          }}
        >
          + Sub set {set.setNumber}.{set.subsetNumber + 1}
        </button>
      ) : null}
    </div>
  );
}

function AddExercisePicker({
  userId,
  sessionId,
  catalog,
  usedIds,
  onClose,
  onRefreshDay,
  onRefreshCatalog,
}: {
  userId: string;
  sessionId: string;
  catalog: CatalogExercise[];
  usedIds: Set<string>;
  onClose: () => void;
  onRefreshDay: () => Promise<unknown>;
  onRefreshCatalog: () => Promise<unknown>;
}) {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(["pecho"]);
  const [, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = catalog.filter((item) => !usedIds.has(item.id));
    if (!q) return pool;
    return pool.filter((item) => item.name.toLowerCase().includes(q));
  }, [catalog, query, usedIds]);

  const grouped = groupByMuscle(filtered);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 sm:items-center sm:p-6">
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white sm:rounded-2xl sm:shadow-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[17px] font-semibold tracking-tight">Agregar ejercicio</h2>
          <button type="button" onClick={onClose} className="text-[15px] text-muted">
            Cerrar
          </button>
        </div>

        <div className="px-5 pb-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar"
            className="w-full rounded-xl bg-sand px-3 py-2.5 text-[15px] outline-none placeholder:text-muted focus:ring-2 focus:ring-teal/30"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          {grouped.map((group) => (
            <div key={group.muscleGroup} className="mb-5">
              <p className="mb-1 text-[13px] font-medium text-muted">{group.label}</p>
              {group.items.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  className="w-full border-b border-line py-3 text-left text-[15px] text-ink"
                  onClick={() => {
                    startTransition(async () => {
                      await addExerciseToSession(supabase, sessionId, exercise.id);
                      await onRefreshDay();
                      onClose();
                    });
                  }}
                >
                  {exercise.name}
                  <MuscleBadges item={exercise} />
                </button>
              ))}
            </div>
          ))}
        </div>

        <form
          className="space-y-2 border-t border-line px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              await createAndAddExercise(supabase, userId, sessionId, name, muscleGroups);
              await Promise.all([onRefreshDay(), onRefreshCatalog()]);
              onClose();
            });
          }}
        >
          <p className="text-[13px] font-medium text-muted">Nuevo ejercicio</p>
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre"
            className="w-full rounded-xl bg-sand px-3 py-2.5 text-[15px] outline-none placeholder:text-muted"
          />
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((group) => {
              const selected = muscleGroups.includes(group);
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => {
                    setMuscleGroups((current) => {
                      if (selected) {
                        const next = current.filter((item) => item !== group);
                        return next.length > 0 ? next : current;
                      }
                      return [...current, group];
                    });
                  }}
                  className="rounded-full px-2.5 py-1 text-[12px] font-medium text-white"
                  style={{
                    backgroundColor: selected ? MUSCLE_GROUP_COLORS[group] : "#d4d4d8",
                  }}
                >
                  {MUSCLE_GROUP_LABELS[group]}
                </button>
              );
            })}
          </div>
          <button type="submit" className="rounded-full bg-teal px-5 py-2.5 text-[15px] font-semibold text-white">
            Crear
          </button>
        </form>
      </div>
    </div>
  );
}
