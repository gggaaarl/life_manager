"use server";

import { createClient } from "@/lib/supabase/server";
import {
  JOB_CODES,
  MEDAL_CODES,
} from "@life-manager/shared/game/constants";
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

export async function unlockMedal(formData: FormData) {
  const { supabase, user } = await requireUser();
  const code = String(formData.get("medal_code") ?? "").trim();

  const { data: medal, error: medalError } = await supabase
    .from("medals")
    .select("id")
    .eq("code", code)
    .single();

  if (medalError || !medal) {
    throw new Error("Medalla no encontrada.");
  }

  const { error } = await supabase.from("user_medals").insert({
    user_id: user.id,
    medal_id: medal.id,
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  revalidatePath("/home");
}

export async function unlockDriverJob() {
  const { supabase, user } = await requireUser();

  const { data: userMedals } = await supabase
    .from("user_medals")
    .select("medals!inner(code)")
    .eq("user_id", user.id)
    .eq("medals.code", MEDAL_CODES.MANEJAR)
    .maybeSingle();

  if (!userMedals) {
    throw new Error("Necesitas la medalla Manejar antes de ser Chofer.");
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("code", JOB_CODES.DRIVER)
    .single();

  if (!job) {
    throw new Error("Job Chofer no encontrado.");
  }

  const { error } = await supabase
    .from("user_jobs")
    .update({
      status: "unlocked",
      unlocked_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("job_id", job.id)
    .eq("status", "locked");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/home");
  revalidatePath("/driver");
}

export async function activateDriverJob() {
  const { supabase, user } = await requireUser();

  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("code", JOB_CODES.DRIVER)
    .single();

  if (!job) {
    throw new Error("Job Chofer no encontrado.");
  }

  const { error } = await supabase
    .from("user_jobs")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("job_id", job.id)
    .in("status", ["unlocked", "active"]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/home");
  revalidatePath("/driver");
}
