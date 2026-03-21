import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionData } from "./session";
import { sessionOptions } from "./session";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  return session;
}

export async function requireRole(role: SessionData["role"]) {
  const session = await requireAuth();
  if (session.role !== role) redirect("/login");
  return session;
}

export async function requireSuperAdmin() {
  return requireRole("SUPER_ADMIN");
}

export async function requireMentor() {
  return requireRole("MENTOR");
}

export async function requirePlayer() {
  return requireRole("PLAYER");
}
