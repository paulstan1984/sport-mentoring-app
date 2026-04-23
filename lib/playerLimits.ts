import type { MentorLevel } from "@/app/generated/prisma/client";

export const PLAYER_LIMITS: Record<MentorLevel, number | null> = {
  FREE: 1,
  MINIMUM: 5,
  MEDIUM: 10,
  PRO: 30,
  ENTERPRISE: null,
};

export const MENTOR_LEVEL_LABELS: Record<MentorLevel, string> = {
  FREE: "Gratuit",
  MINIMUM: "Minim",
  MEDIUM: "Mediu",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};
