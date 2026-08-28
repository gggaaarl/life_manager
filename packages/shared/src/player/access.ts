const INAUGURAL_USER_ID = "f4689015-61af-4e89-81c3-00b00be1b1cb";

type ProfileAccess = {
  role: "admin" | "user" | null;
  experimental_profiles: string[] | null;
};

type JobStatusRow = {
  code: string;
  status: "locked" | "unlocked" | "active";
};

type ProfilesRow = {
  role?: string | null;
  experimental_profiles?: string[] | null;
};

export async function getProfileAccess(supabase: unknown, userId: string): Promise<ProfileAccess> {
  const client = supabase as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: ProfilesRow | null }>;
        };
      };
    };
  };

  const { data } = await client
    .from("profiles")
    .select("role, experimental_profiles")
    .eq("id", userId)
    .maybeSingle();

  return {
    role: (data?.role as ProfileAccess["role"]) ?? null,
    experimental_profiles: data?.experimental_profiles ?? null,
  };
}

export function canAccessPlayerMenu(
  profile: ProfileAccess,
  userId: string,
  userJobs: JobStatusRow[] = [],
): boolean {
  const player = userJobs.find((job) => job.code === "PLAYER");
  if (player && (player.status === "active" || player.status === "unlocked")) {
    return true;
  }

  if (userId === INAUGURAL_USER_ID) {
    return true;
  }

  if (profile.role === "admin") {
    return true;
  }

  return profile.experimental_profiles?.includes("player") ?? false;
}
