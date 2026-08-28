"use client";

import { useRouter } from "next/navigation";

export function DayPicker({ value }: { value: string }) {
  const router = useRouter();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const date = new FormData(form).get("date");
        if (typeof date === "string" && date) {
          router.push(`?date=${date}`);
        }
      }}
    >
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Día</span>
        <input
          type="date"
          name="date"
          defaultValue={value}
          className="rounded-xl border border-line bg-panel px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white"
      >
        Ver día
      </button>
    </form>
  );
}
