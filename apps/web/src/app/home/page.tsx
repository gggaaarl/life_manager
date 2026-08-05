import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SessionInfo } from "@/components/auth/session-info";
import { canAccessPlayerMenu, getProfileAccess } from "@/lib/player/access";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, avatar_url, role, experimental_profiles")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.display_name ??
    user.user_metadata?.full_name ??
    user.email ??
    "Usuario";

  const accessProfile = await getProfileAccess(supabase, user.id);
  const showPlayerMenu = canAccessPlayerMenu(accessProfile, user.id);

  return (
    <main className="min-h-dvh bg-sand px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-teal">
              LIFE MANAGER
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-ink">
              Hola, {name}
            </h1>
            <p className="mt-2 text-muted">
              Sesión activa con Google / Supabase. Aquí irá el hub de jobs.
            </p>
          </div>
          <SignOutButton />
        </header>

        <SessionInfo
          userId={user.id}
          email={profile?.email ?? user.email}
          role={accessProfile.role}
          experimentalProfiles={accessProfile.experimental_profiles}
        />

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <p className="text-sm text-muted">Job activo</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              PLAYER
            </p>
            <p className="mt-2 text-sm text-muted">
              {showPlayerMenu
                ? "Historial de citas disponible en el menú experimental."
                : "Bloqueado para tu perfil por ahora."}
            </p>
            {showPlayerMenu ? (
              <Link
                href="/player/citas"
                className="mt-4 inline-flex rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Abrir citas
              </Link>
            ) : null}
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <p className="text-sm text-muted">Próximo</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              DRIVER
            </p>
            <p className="mt-2 text-sm text-muted">Job bloqueado — por desbloquear.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
