import { CitaForm } from "@/components/player/cita-form";
import { CitasTable, type CitaRow } from "@/components/player/citas-table";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SessionInfo } from "@/components/auth/session-info";
import { canAccessPlayerMenu, getProfileAccess } from "@/lib/player/access";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
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
  if (!canAccessPlayerMenu(profile, user.id)) {
    redirect("/home");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: citasRaw, error: citasError } = await supabase
    .from("player_citas")
    .select(
      "id, fecha, persona, caracteristica, color, talla, figura, lugar, puntaje_promedio",
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
    comentarios: comentariosByCita.get(cita.id) ?? [],
  }));

  const queryError = citasError?.message ?? comentariosError?.message ?? null;

  return (
    <main className="min-h-dvh bg-sand px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link
              href="/home"
              className="text-sm font-medium text-teal transition hover:opacity-80"
            >
              ← Volver al hub
            </Link>
            <p className="mt-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-teal">
              PLAYER
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-ink">
              Citas
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              Tabla suave para ver y llenar historial. Persona con comillas simples, dichos con
              comillas dobles, pensamientos entre paréntesis.
            </p>
          </div>
          <SignOutButton />
        </header>

        <div className="mb-6 space-y-4">
          <SessionInfo
            userId={user.id}
            email={profileRow?.email ?? user.email}
            role={profile.role}
            experimentalProfiles={profile.experimental_profiles}
          />

          {queryError ? (
            <div className="rounded-2xl border border-[var(--lm-danger)]/30 bg-white p-4 text-sm text-[var(--lm-danger)]">
              <p className="font-semibold">Error al leer citas desde Supabase</p>
              <p className="mt-1 break-all font-mono text-xs">{queryError}</p>
              <p className="mt-2 text-sm text-muted">
                Si el UUID de arriba coincide con `profiles.id` y aún falla, en Supabase Dashboard
                ve a Settings → API → Reload schema.
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <CitaForm />
          <CitasTable citas={citas} />
        </div>
      </div>
    </main>
  );
}
