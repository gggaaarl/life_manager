"use server";

import { createClient } from "@/lib/supabase/server";
import {
  addExerciseToDay,
  addSet,
  addSubset,
  changeSetKind,
  createAndAddExercise,
  deleteEntry,
  deleteSetRow,
  updateSetFields,
} from "@life-manager/shared/workout/api";
import { isMuscleGroup, isSetKind } from "@life-manager/shared/workout/constants";
import { parseOptionalInt, parseOptionalNumber, parseOptionalRir } from "@life-manager/shared/workout/logic";
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

function trainerPath(date: string) {
  return `/trainer?date=${date}`;
}

export async function addExerciseAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const date = String(formData.get("date") ?? "");
  const exerciseId = String(formData.get("exerciseId") ?? "");
  await addExerciseToDay(supabase, user.id, date, exerciseId);
  revalidatePath(trainerPath(date));
}

export async function createExerciseAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const date = String(formData.get("date") ?? "");
  const name = String(formData.get("name") ?? "");
  const muscle = String(formData.get("muscleGroup") ?? "");
  if (!isMuscleGroup(muscle)) {
    throw new Error("Parte muscular inválida.");
  }
  await createAndAddExercise(supabase, user.id, date, name, muscle);
  revalidatePath(trainerPath(date));
}

export async function addSetAction(formData: FormData) {
  const { supabase } = await requireUser();
  const date = String(formData.get("date") ?? "");
  await addSet(supabase, String(formData.get("entryId") ?? ""));
  revalidatePath(trainerPath(date));
}

export async function addSubsetAction(formData: FormData) {
  const { supabase } = await requireUser();
  const date = String(formData.get("date") ?? "");
  await addSubset(
    supabase,
    String(formData.get("entryId") ?? ""),
    Number(formData.get("setNumber")),
  );
  revalidatePath(trainerPath(date));
}

export async function updateSetAction(formData: FormData) {
  const { supabase } = await requireUser();
  const date = String(formData.get("date") ?? "");
  await updateSetFields(supabase, String(formData.get("setId") ?? ""), {
    weightKg: parseOptionalNumber(String(formData.get("weightKg") ?? "")),
    reps: parseOptionalInt(String(formData.get("reps") ?? "")),
    rir: parseOptionalRir(String(formData.get("rir") ?? "")),
  });
  revalidatePath(trainerPath(date));
}

export async function changeSetKindAction(formData: FormData) {
  const { supabase } = await requireUser();
  const date = String(formData.get("date") ?? "");
  const kind = String(formData.get("setKind") ?? "");
  if (!isSetKind(kind)) {
    throw new Error("Tipo de set inválido.");
  }
  await changeSetKind(
    supabase,
    String(formData.get("entryId") ?? ""),
    Number(formData.get("setNumber")),
    kind,
  );
  revalidatePath(trainerPath(date));
}

export async function deleteSetAction(formData: FormData) {
  const { supabase } = await requireUser();
  const date = String(formData.get("date") ?? "");
  await deleteSetRow(supabase, String(formData.get("setId") ?? ""));
  revalidatePath(trainerPath(date));
}

export async function deleteEntryAction(formData: FormData) {
  const { supabase } = await requireUser();
  const date = String(formData.get("date") ?? "");
  await deleteEntry(supabase, String(formData.get("entryId") ?? ""));
  revalidatePath(trainerPath(date));
}
