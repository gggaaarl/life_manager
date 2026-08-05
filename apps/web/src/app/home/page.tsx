import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { SessionDebugLog } from "@/components/debug/console-log";
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
    <main className="min-h-dvh bg-sand">
      <AppHeader showPlayerMenu={showPlayerMenu} />
      <SessionDebugLog
        page="home"
        userId={user.id}
        email={profile?.email ?? user.email}
        role={accessProfile.role}
        experimentalProfiles={accessProfile.experimental_profiles}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-ink">
            Hola, {name}
          </h1>
          <p className="mt-2 text-muted">Hub de jobs — elige por dónde seguir.</p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <p className="text-sm text-muted">Job activo</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              PLAYER
            </p>
            <p className="mt-2 text-sm text-muted">
              {showPlayerMenu
                ? "Historial de salidas disponible."
                : "Bloqueado para tu perfil por ahora."}
            </p>
            {showPlayerMenu ? (
              <Link
                href="/player/citas"
                className="mt-4 inline-flex rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Abrir salidas
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
