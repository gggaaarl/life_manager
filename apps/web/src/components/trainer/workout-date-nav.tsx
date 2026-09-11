"use client";

import { useRouter } from "next/navigation";
import { shiftDate } from "@life-manager/shared/workout/constants";

function formatDayLabel(dateYmd: string): string {
  const [year, month, day] = dateYmd.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

export function WorkoutDateNav({ value }: { value: string }) {
  const router = useRouter();

  function go(next: string) {
    router.push(`/trainer?date=${next}`);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => go(shiftDate(value, -1))}
        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink hover:bg-panel-hover"
        aria-label="Día anterior"
      >
        ‹
      </button>
      <div className="text-center">
        <h1 className="text-[17px] font-semibold tracking-tight text-ink">Entrenamiento</h1>
        <p className="text-[13px] capitalize text-muted">{formatDayLabel(value)}</p>
      </div>
      <button
        type="button"
        onClick={() => go(shiftDate(value, 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink hover:bg-panel-hover"
        aria-label="Día siguiente"
      >
        ›
      </button>
    </div>
  );
}
