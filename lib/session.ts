import type { SessionOptions } from "iron-session";

export interface SessionData {
  userId: number;
  role: "SUPER_ADMIN" | "MENTOR" | "PLAYER";
  mentorId?: number;
  playerId?: number;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "sport-session",
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};
