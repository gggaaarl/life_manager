export type AccountProfile = {
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function accountFromUser(user: UserLike | null | undefined): AccountProfile {
  const meta = user?.user_metadata ?? {};
  return {
    email: text(user?.email) ?? text(meta.email),
    name: text(meta.full_name) ?? text(meta.name) ?? text(meta.display_name),
    avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
  };
}

export function accountInitial(account: AccountProfile): string {
  const source = account.name ?? account.email ?? "?";
  return source.slice(0, 1).toUpperCase();
}
