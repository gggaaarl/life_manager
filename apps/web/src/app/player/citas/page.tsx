import { CitaForm } from "@/components/player/cita-form";
import { CitasTable, type CitaRow } from "@/components/player/citas-table";
import { SignOutButton } from "@/components/auth/sign-out-button";
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

  const { data: citasRaw } = await supabase
    .from("player_citas")
    .select(
      `
      id,
      fecha,
      persona,
      caracteristica,
      color,
      talla,
      figura,
      lugar,
      puntaje_promedio,
      player_citas_comentarios (
        id,
        contenido,
        tipo,
        orden
      )
    `,
    )
    .eq("user_id", user.id)
    .order("fecha", { ascending: false });

  const citas: CitaRow[] = (citasRaw ?? []).map((cita) => ({
    ...cita,
    comentarios: [...(cita.player_citas_comentarios ?? [])].sort(
      (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
    ),
  }));

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

        <div className="space-y-6">
          <CitaForm />
          <CitasTable citas={citas} />
        </div>
      </div>
    </main>
  );
}
