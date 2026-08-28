export const MEDAL_CODES = {
  MANEJAR: "manejar",
} as const;

export const JOB_CODES = {
  TRAINEE: "TRAINEE",
  DRIVER: "DRIVER",
  PLAYER: "PLAYER",
} as const;

export type JobCode = (typeof JOB_CODES)[keyof typeof JOB_CODES];

export type UserJobRow = {
  code: string;
  name: string;
  status: "locked" | "unlocked" | "active";
};

export type MedalRow = {
  code: string;
  name: string;
  description: string | null;
  unlocked: boolean;
};

export function canUnlockDriverJob(medalCodesUnlocked: string[]): boolean {
  return medalCodesUnlocked.includes(MEDAL_CODES.MANEJAR);
}

export function jobStatusLabel(status: UserJobRow["status"]): string {
  switch (status) {
    case "active":
      return "Activo";
    case "unlocked":
      return "Desbloqueado";
    default:
      return "Bloqueado";
  }
}
