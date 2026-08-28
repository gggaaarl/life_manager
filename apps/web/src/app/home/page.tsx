import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { GameHub } from "@/components/game/game-hub";
import { canAccessPlayerMenu, getProfileAccess } from "@life-manager/shared/player/access";
import type { MedalRow, UserJobRow } from "@life-manager/shared/game/constants";

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
    .select("display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.display_name ??
    user.user_metadata?.full_name ??
    user.email ??
    "Usuario";

  const accessProfile = await getProfileAccess(supabase, user.id);
  const showPlayerMenu = canAccessPlayerMenu(accessProfile, user.id);

  const [{ data: jobsRaw }, { data: medalsRaw }, { data: userMedals }] = await Promise.all([
    supabase
      .from("user_jobs")
      .select("status, jobs(code, name, sort_order)")
      .eq("user_id", user.id),
    supabase.from("medals").select("code, name, description, sort_order").order("sort_order"),
    supabase.from("user_medals").select("medal_id, medals(code)").eq("user_id", user.id),
  ]);

  const unlockedCodes = new Set<string>();
  for (const row of userMedals ?? []) {
    const medal = row.medals as { code: string } | { code: string }[] | null;
    const code = Array.isArray(medal) ? medal[0]?.code : medal?.code;
    if (code) {
      unlockedCodes.add(code);
    }
  }

  const jobs: UserJobRow[] = (jobsRaw ?? [])
    .flatMap((row) => {
      const job = row.jobs as { code: string; name: string; sort_order: number } | null;
      if (!job) {
        return [];
      }
      return [
        {
          code: job.code,
          name: job.name,
          status: row.status as UserJobRow["status"],
          sort_order: job.sort_order,
        },
      ];
    })
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ sort_order: _ignored, ...rest }) => rest);

  const medals: MedalRow[] = (medalsRaw ?? []).map((medal) => ({
    code: medal.code,
    name: medal.name,
    description: medal.description,
    unlocked: unlockedCodes.has(medal.code),
  }));

  const driverJob = jobs.find((job) => job.code === "DRIVER");
  const showDriverMenu =
    driverJob?.status === "active" || driverJob?.status === "unlocked";

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader
        showPlayerMenu={showPlayerMenu}
        showNutritionMenu
        showFinanceMenu
        showDriverMenu={showDriverMenu}
      />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-ink">
            Hola, {name}
          </h1>
          <p className="mt-2 text-muted">Tu hub.</p>
        </div>

        <div className="mt-8">
          <GameHub
            jobs={jobs}
            medals={medals}
            unlockedMedalCodes={[...unlockedCodes]}
          />
        </div>
      </div>
    </main>
  );
}
