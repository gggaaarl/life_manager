import { AppHeader } from "@/components/layout/app-header";
import { getUserNavJobs } from "@/lib/nav/get-user-nav-jobs";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DeveloperPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const userJobs = await getUserNavJobs(supabase, user.id);

  return (
    <main className="min-h-dvh bg-sand">
      <AppHeader userJobs={userJobs} />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Desarrollador
        </h1>
        <p className="mt-2 text-sm text-muted">Próximamente.</p>
      </div>
    </main>
  );
}
