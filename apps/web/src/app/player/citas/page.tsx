import { CitaForm } from "@/components/player/cita-form";
import { CitasTable, type CitaRow } from "@/components/player/citas-table";
import { AppHeader } from "@/components/layout/app-header";
import { CitasDebugLog } from "@/components/debug/console-log";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import { getUserJobStatuses, getUserNavJobs } from "@/lib/nav/get-user-nav-jobs";
import type { PlayerPresion } from "@life-manager/shared/player/constants";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PlayerCitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileAccess(supabase, user.id);
  const jobStatuses = await getUserJobStatuses(supabase, user.id);
  if (!canAccessPlayerMenu(profile, user.id, jobStatuses)) {
    redirect("/finance");
  }

  const userJobs = await getUserNavJobs(supabase, user.id);

  const { data: citasRaw, error: citasError } = await supabase
    .from("player_citas")
    .select(
      "id, fecha, persona, caracteristica, color, talla, figura, belleza, top, bottom, presion, lugar, paciencia_minutos, puntaje",
    )
    .eq("user_id", user.id)
    .order("fecha", { ascending: false });

  const citaIds = citasRaw?.map((cita) => cita.id) ?? [];

  const { data: comentariosRaw, error: comentariosError } =
    citaIds.length > 0
      ? await supabase
          .from("player_citas_comentarios")
          .select("id, cita_id, contenido, tipo, orden")
          .in("cita_id", citaIds)
          .order("orden", { ascending: true })
      : { data: [], error: null };

  const comentariosByCita = new Map<string, CitaRow["comentarios"]>();
  for (const comentario of comentariosRaw ?? []) {
    const list = comentariosByCita.get(comentario.cita_id) ?? [];
    list.push({
      id: comentario.id,
      contenido: comentario.contenido,
      tipo: comentario.tipo,
    });
    comentariosByCita.set(comentario.cita_id, list);
  }

  const citas: CitaRow[] = (citasRaw ?? []).map((cita) => ({
    ...cita,
    presion: (cita.presion ?? "regular") as PlayerPresion,
    comentarios: comentariosByCita.get(cita.id) ?? [],
  }));

  const queryError = citasError?.message ?? comentariosError?.message ?? null;

  if (process.env.NODE_ENV === "development") {
    console.log("[Life Manager] SERVER player/citas", {
      userId: user.id,
      citasCount: citas.length,
      queryError,
    });
  }

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader userJobs={userJobs} />
      <CitasDebugLog userId={user.id} citasCount={citas.length} queryError={queryError} />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-teal">
            PLAYER
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-ink">
            Salidas
          </h1>
        </div>

        {queryError ? (
          <div className="mb-6 rounded-2xl border border-[var(--lm-danger)]/30 bg-panel p-4 text-sm text-[var(--lm-danger)]">
            <p className="font-semibold">Error al leer salidas desde Supabase</p>
            <p className="mt-1 break-all font-mono text-xs">{queryError}</p>
          </div>
        ) : null}

        <div className="space-y-6">
          <CitaForm />
          <CitasTable citas={citas} />
        </div>
      </div>
    </main>
  );
}
