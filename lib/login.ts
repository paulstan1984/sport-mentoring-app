import type { SessionData } from "./session";
import { db } from "./db";

type LoginUser = {
  id: number;
  role: SessionData["role"];
};

export type LoginAccountState =
  | { active: true; mentorId?: number; playerId?: number }
  | { active: false; error: string };

export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: "Utilizator sau parolă incorectă.",
  inactiveMentor: "Contul tău a fost dezactivat. Contactează administratorul.",
  inactivePlayer: "Contul tău a fost dezactivat. Contactează antrenorul.",
} as const;

export async function getLoginAccountState(user: LoginUser): Promise<LoginAccountState> {
  if (user.role === "SUPER_ADMIN") {
    return { active: true };
  }

  if (user.role === "MENTOR") {
    const mentor = await db.mentor.findUnique({ where: { userId: user.id } });
    if (!mentor || !mentor.isActive) {
      return { active: false, error: LOGIN_ERROR_MESSAGES.inactiveMentor };
    }
    return { active: true, mentorId: mentor.id };
  }

  const player = await db.player.findUnique({ where: { userId: user.id } });
  if (!player || !player.isActive) {
    return { active: false, error: LOGIN_ERROR_MESSAGES.inactivePlayer };
  }
  return { active: true, playerId: player.id };
}

export function getLoginDestination(role: SessionData["role"]): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin/mentors";
    case "MENTOR":
      return "/mentor/dashboard";
    case "PLAYER":
      return "/player/dashboard";
  }
}
