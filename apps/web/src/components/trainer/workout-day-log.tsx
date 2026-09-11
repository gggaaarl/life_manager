"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addExerciseAction,
  addSetAction,
  addSubsetAction,
  changeSetKindAction,
  createExerciseAction,
  deleteEntryAction,
  deleteSetAction,
  updateSetAction,
} from "@/app/trainer/actions";
import {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_LABELS,
  SET_KINDS,
  SET_KIND_LABELS,
  isSpecialSetKind,
  type MuscleGroup,
} from "@life-manager/shared/workout/constants";
import {
  formatSetLabel,
  groupByMuscle,
  numberToInput,
  type CatalogExercise,
  type WorkoutEntryView,
} from "@life-manager/shared/workout/logic";

type Props = {
  date: string;
  catalog: CatalogExercise[];
  entries: WorkoutEntryView[];
};

const cellInput =
  "h-9 w-full min-w-0 rounded-md border-0 bg-transparent px-1 text-center text-[15px] tabular-nums text-ink outline-none placeholder:text-muted/50 focus:bg-sand";

const tableGrid =
  "grid grid-cols-[2.25rem_minmax(3.25rem,1fr)_minmax(3.25rem,1fr)_minmax(2.75rem,0.85fr)_minmax(5.75rem,7rem)_1.5rem] items-center gap-x-1";

export function WorkoutDayLog({ date, catalog, entries }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const muscleGroups = groupByMuscle(entries);
  let exerciseNumber = 0;

  return (
    <div className="pb-24">
      {entries.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-muted">
          Todavía no hay ejercicios en este día.
        </p>
      ) : (
        <div className="space-y-8">
          {muscleGroups.map((group) => (
            <section key={group.muscleGroup}>
              <p className="mb-3 text-[13px] font-medium text-muted">{group.label}</p>
              <div className="space-y-7">
                {group.items.map((entry) => {
                  exerciseNumber += 1;
                  return (
                    <ExerciseBlock
                      key={entry.id}
                      date={date}
                      entry={entry}
                      number={exerciseNumber}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mx-auto block w-full max-w-md rounded-full bg-teal py-3.5 text-[15px] font-semibold text-white sm:w-auto sm:px-8"
        >
          Agregar ejercicio
        </button>
      </div>

      {pickerOpen ? (
        <AddExercisePicker
          date={date}
          catalog={catalog}
          usedIds={new Set(entries.map((entry) => entry.exerciseId))}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}

function ExerciseBlock({
  date,
  entry,
  number,
}: {
  date: string;
  entry: WorkoutEntryView;
  number: number;
}) {
  const [, startTransition] = useTransition();

  return (
    <article>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[16px] font-semibold tracking-tight text-ink">
          <span className="mr-2 font-medium text-muted">{number}</span>
          {entry.exerciseName}
        </h3>
        <form
          action={(formData) => {
            startTransition(() => {
              void deleteEntryAction(formData);
            });
          }}
        >
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="entryId" value={entry.id} />
          <button type="submit" className="text-[13px] text-muted hover:text-ink">
            Quitar
          </button>
        </form>
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
        <SetRow key={set.id} date={date} entryId={entry.id} sets={entry.sets} set={set} />
      ))}

      <form
        className="mt-1"
        action={(formData) => {
          startTransition(() => {
            void addSetAction(formData);
          });
        }}
      >
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="entryId" value={entry.id} />
        <button type="submit" className="w-full py-2.5 text-center text-[14px] font-medium text-teal">
          + Agregar set
        </button>
      </form>
    </article>
  );
}

function SetRow({
  date,
  entryId,
  sets,
  set,
}: {
  date: string;
  entryId: string;
  sets: WorkoutEntryView["sets"];
  set: WorkoutEntryView["sets"][number];
}) {
  const [, startTransition] = useTransition();
  const special = isSpecialSetKind(set.setKind);
  const isLastSubset =
    special &&
    set.subsetNumber ===
      Math.max(...sets.filter((row) => row.setNumber === set.setNumber).map((row) => row.subsetNumber));

  function saveFields(form: HTMLFormElement) {
    startTransition(() => {
      void updateSetAction(new FormData(form));
    });
  }

  return (
    <div className="border-b border-line">
      <form
        className={`${tableGrid} py-1`}
        onBlur={(event) => {
          const next = event.relatedTarget as Node | null;
          if (next && event.currentTarget.contains(next)) return;
          saveFields(event.currentTarget);
        }}
      >
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="setId" value={set.id} />
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
            const form = event.currentTarget.form;
            if (!form) return;
            const data = new FormData(form);
            data.set("entryId", entryId);
            data.set("setNumber", String(set.setNumber));
            data.set("setKind", event.target.value);
            startTransition(() => {
              void changeSetKindAction(data);
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
            const data = new FormData();
            data.set("date", date);
            data.set("setId", set.id);
            startTransition(() => {
              void deleteSetAction(data);
            });
          }}
        >
          ✕
        </button>
      </form>

      {isLastSubset ? (
        <form
          action={(formData) => {
            startTransition(() => {
              void addSubsetAction(formData);
            });
          }}
        >
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="entryId" value={entryId} />
          <input type="hidden" name="setNumber" value={set.setNumber} />
          <button type="submit" className="w-full py-2 text-center text-[13px] font-medium text-teal">
            + Sub set {set.setNumber}.{set.subsetNumber + 1}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function AddExercisePicker({
  date,
  catalog,
  usedIds,
  onClose,
}: {
  date: string;
  catalog: CatalogExercise[];
  usedIds: Set<string>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("pecho");
  const [, startTransition] = useTransition();

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
                <form
                  key={exercise.id}
                  action={(formData) => {
                    startTransition(async () => {
                      await addExerciseAction(formData);
                      onClose();
                    });
                  }}
                >
                  <input type="hidden" name="date" value={date} />
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <button
                    type="submit"
                    className="w-full border-b border-line py-3 text-left text-[15px] text-ink"
                  >
                    {exercise.name}
                  </button>
                </form>
              ))}
            </div>
          ))}
        </div>

        <form
          className="space-y-2 border-t border-line px-5 py-4"
          action={(formData) => {
            startTransition(async () => {
              await createExerciseAction(formData);
              onClose();
            });
          }}
        >
          <p className="text-[13px] font-medium text-muted">Nuevo ejercicio</p>
          <input type="hidden" name="date" value={date} />
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre"
            className="w-full rounded-xl bg-sand px-3 py-2.5 text-[15px] outline-none placeholder:text-muted"
          />
          <div className="flex gap-2">
            <select
              name="muscleGroup"
              value={muscleGroup}
              onChange={(event) => setMuscleGroup(event.target.value as MuscleGroup)}
              className="flex-1 rounded-xl bg-sand px-3 py-2.5 text-[15px]"
            >
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {MUSCLE_GROUP_LABELS[group]}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-full bg-teal px-5 py-2.5 text-[15px] font-semibold text-white">
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
