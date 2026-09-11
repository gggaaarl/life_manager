import { AppHeader } from "@/components/layout/app-header";
import { WorkoutDateNav } from "@/components/trainer/workout-date-nav";
import { WorkoutDayLog } from "@/components/trainer/workout-day-log";
import { todayInLima } from "@life-manager/shared/workout/constants";
import { listCatalogExercises, loadWorkoutDay } from "@life-manager/shared/workout/api";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function TrainerPage({ searchParams }: PageProps) {
  const { date: dateParam } = await searchParams;
  const workDate = dateParam ?? todayInLima();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [catalog, entries] = await Promise.all([
    listCatalogExercises(supabase),
    loadWorkoutDay(supabase, user.id, workDate),
  ]);

  return (
    <main className="min-h-dvh bg-white">
      <AppHeader />
      <div className="mx-auto max-w-lg px-4 pb-8 pt-4 sm:px-6">
        <WorkoutDateNav value={workDate} />
        <div className="mt-6">
          <WorkoutDayLog date={workDate} catalog={catalog} entries={entries} />
        </div>
      </div>
    </main>
  );
}
