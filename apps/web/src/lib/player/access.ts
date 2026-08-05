import type { SupabaseClient } from "@supabase/supabase-js";

const INAUGURAL_USER_ID = "f4689015-61af-4e89-81c3-00b00be1b1cb";

type ProfileAccess = {
  role: "admin" | "user" | null;
  experimental_profiles: string[] | null;
};

export async function getProfileAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileAccess> {
  const { data } = await supabase
    .from("profiles")
    .select("role, experimental_profiles")
    .eq("id", userId)
    .maybeSingle();

  return {
    role: (data?.role as ProfileAccess["role"]) ?? null,
    experimental_profiles: data?.experimental_profiles ?? null,
  };
}

export function canAccessPlayerMenu(profile: ProfileAccess, userId: string): boolean {
  if (userId === INAUGURAL_USER_ID) {
    return true;
  }

  if (profile.role === "admin") {
    return true;
  }

  return profile.experimental_profiles?.includes("player") ?? false;
}
