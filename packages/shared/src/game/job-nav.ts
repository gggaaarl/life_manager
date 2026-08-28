export const NAV_JOB_CODES = ["DEVELOPER", "TRAINER", "DRIVER", "BOTANICO", "PLAYER"] as const;

export type NavJobCode = (typeof NAV_JOB_CODES)[number];

export type NavJob = {
  code: string;
  label: string;
  href: string;
  status: "locked" | "unlocked" | "active";
};

export function jobNavLabel(code: string): string {
  switch (code) {
    case "DEVELOPER":
      return "desarrollador";
    case "TRAINER":
      return "trainer";
    case "DRIVER":
      return "taxi";
    case "BOTANICO":
      return "botánico";
    case "PLAYER":
      return "player";
    default:
      return code.toLowerCase();
  }
}

export function jobNavHref(code: string): string | null {
  switch (code) {
    case "DEVELOPER":
      return "/developer";
    case "TRAINER":
      return "/trainer";
    case "DRIVER":
      return "/driver";
    case "BOTANICO":
      return "/nutrition";
    case "PLAYER":
      return "/player/citas";
    default:
      return null;
  }
}

export function sortNavJobs<T extends { code: string }>(jobs: T[]): T[] {
  return [...jobs].sort(
    (a, b) => NAV_JOB_CODES.indexOf(a.code as NavJobCode) - NAV_JOB_CODES.indexOf(b.code as NavJobCode),
  );
}

export function isNavJobAccessible(status: NavJob["status"]): boolean {
  return status === "active" || status === "unlocked";
}

export function hasActivePlayerJob(jobs: { code: string; status: NavJob["status"] }[]): boolean {
  const player = jobs.find((job) => job.code === "PLAYER");
  return player != null && isNavJobAccessible(player.status);
}
