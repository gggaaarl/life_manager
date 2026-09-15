"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WorkoutDateNav } from "@/components/trainer/workout-date-nav";
import { WorkoutDayLog } from "@/components/trainer/workout-day-log";
import { createClient } from "@/lib/supabase/client";
import { listCatalogExercises, loadWorkoutDay, reorderDayEntry } from "@life-manager/shared/workout/api";
import { todayInLima } from "@life-manager/shared/workout/constants";
import {
  applySetFieldsToDay,
  moveEntryInDay,
  type CatalogExercise,
  type WorkoutDayView,
} from "@life-manager/shared/workout/logic";

type Props = {
  userId: string;
  initialDate: string;
  initialCatalog: CatalogExercise[];
  initialDay: WorkoutDayView;
};

export function WorkoutTrainer({
  userId,
  initialDate,
  initialCatalog,
  initialDay,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [date, setDate] = useState(initialDate);
  const [catalog, setCatalog] = useState(initialCatalog);
  const [day, setDay] = useState(initialDay);
  const [loadingDay, setLoadingDay] = useState(false);
  const skipFirstLoad = useRef(true);

  useEffect(() => {
    function onPop() {
      const next = new URLSearchParams(window.location.search).get("date") ?? todayInLima();
      setDate(next);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    let cancelled = false;
    setLoadingDay(true);
    loadWorkoutDay(supabase, userId, date)
      .then((next) => {
        if (!cancelled) setDay(next);
      })
      .finally(() => {
        if (!cancelled) setLoadingDay(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, supabase, userId]);

  async function refreshDay() {
    const next = await loadWorkoutDay(supabase, userId, date);
    setDay(next);
    return next;
  }

  async function refreshCatalog() {
    const next = await listCatalogExercises(supabase);
    setCatalog(next);
    return next;
  }

  function onSetFieldsChange(
    setId: string,
    fields: { weightKg?: number | null; reps?: number | null; rir?: number | null },
  ) {
    setDay((current) => applySetFieldsToDay(current, setId, fields));
  }

  async function onReorderEntry(entryId: string, position: number) {
    setDay((current) => moveEntryInDay(current, entryId, position));
    await reorderDayEntry(supabase, entryId, position);
    await refreshDay();
  }

  return (
    <>
      <WorkoutDateNav value={date} onChange={setDate} />
      <div className="mt-6">
        {loadingDay ? (
          <p className="py-16 text-center text-[15px] text-muted">Cargando…</p>
        ) : (
          <WorkoutDayLog
            date={date}
            userId={userId}
            catalog={catalog}
            day={day}
            onRefreshDay={refreshDay}
            onRefreshCatalog={refreshCatalog}
            onSetFieldsChange={onSetFieldsChange}
            onReorderEntry={onReorderEntry}
          />
        )}
      </div>
    </>
  );
}
