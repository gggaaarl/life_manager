import {
  isNavJobAccessible,
  jobNavHref,
  jobNavLabel,
  NAV_JOB_CODES,
  sortNavJobs,
  type NavJob,
} from "@life-manager/shared/game/job-nav";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

type UserJobQueryRow = {
  status: NavJob["status"];
  jobs: { code: string; sort_order: number } | { code: string; sort_order: number }[] | null;
};

export async function getUserNavJobs(
  supabase: SupabaseServer,
  userId: string,
): Promise<NavJob[]> {
  const { data } = await supabase
    .from("user_jobs")
    .select("status, jobs(code, sort_order)")
    .eq("user_id", userId);

  const rows = (data ?? []) as UserJobQueryRow[];

  return sortNavJobs(
    rows
      .map((row) => {
        const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
        if (!job || !NAV_JOB_CODES.includes(job.code as (typeof NAV_JOB_CODES)[number])) {
          return null;
        }
        const href = jobNavHref(job.code);
        if (!href || !isNavJobAccessible(row.status)) {
          return null;
        }
        return {
          code: job.code,
          label: jobNavLabel(job.code),
          href,
          status: row.status,
        } satisfies NavJob;
      })
      .filter((row): row is NavJob => row != null),
  );
}

export async function getUserJobStatuses(
  supabase: SupabaseServer,
  userId: string,
): Promise<{ code: string; status: NavJob["status"] }[]> {
  const { data } = await supabase
    .from("user_jobs")
    .select("status, jobs(code)")
    .eq("user_id", userId);

  return (data ?? [])
    .map((row) => {
      const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
      if (!job?.code) return null;
      return { code: job.code, status: row.status as NavJob["status"] };
    })
    .filter((row): row is { code: string; status: NavJob["status"] } => row != null);
}
