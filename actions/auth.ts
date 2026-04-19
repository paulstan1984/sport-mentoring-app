"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function login(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Completați toate câmpurile." };
  }

  const user = await db.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Utilizator sau parolă incorectă." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Utilizator sau parolă incorectă." };
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;

  if (user.role === "MENTOR") {
    const mentor = await db.mentor.findUnique({ where: { userId: user.id } });
    if (!mentor || !mentor.isActive) {
      return { error: "Contul tău a fost dezactivat. Contactează administratorul." };
    }
    session.mentorId = mentor.id;
  } else if (user.role === "PLAYER") {
    const player = await db.player.findUnique({ where: { userId: user.id } });
    if (!player || !player.isActive) {
      return { error: "Contul tău a fost dezactivat. Contactează antrenorul." };
    }
    session.playerId = player.id;
  }

  await session.save();

  if (user.role === "SUPER_ADMIN") redirect("/admin/mentors");
  if (user.role === "MENTOR") redirect("/mentor/dashboard");
  redirect("/player/dashboard");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

// ── Impersonation ─────────────────────────────────────────────────────────────

export async function impersonateMentor(formData: FormData): Promise<void> {
  const session = await getSession();
  if (session.role !== "SUPER_ADMIN") throw new Error("Neautorizat.");

  const mentorId = Number(formData.get("mentorId"));
  if (!mentorId) throw new Error("ID antrenor lipsă.");

  const mentor = await db.mentor.findUnique({ where: { id: mentorId } });
  if (!mentor) throw new Error("Antrenorul nu a fost găsit.");

  const originalUserId = session.userId;

  session.role = "MENTOR";
  session.userId = mentor.userId;
  session.mentorId = mentor.id;
  session.playerId = undefined;
  session.impersonating = true;
  session.originalUserId = originalUserId;
  await session.save();

  redirect("/mentor/dashboard");
}

export async function impersonatePlayer(formData: FormData): Promise<void> {
  const session = await getSession();
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const isImpersonating = session.impersonating === true;
  if (!isSuperAdmin && !isImpersonating) throw new Error("Neautorizat.");

  const playerId = Number(formData.get("playerId"));
  if (!playerId) throw new Error("ID jucător lipsă.");

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player) throw new Error("Jucătorul nu a fost găsit.");

  // Preserve the root super-admin user id across nested impersonation
  const originalUserId = session.originalUserId ?? session.userId;

  session.role = "PLAYER";
  session.userId = player.userId;
  session.playerId = player.id;
  session.mentorId = undefined;
  session.impersonating = true;
  session.originalUserId = originalUserId;
  await session.save();

  redirect("/player/dashboard");
}

export async function stopImpersonation(_formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session.impersonating || !session.originalUserId) {
    redirect("/login");
  }

  session.role = "SUPER_ADMIN";
  session.userId = session.originalUserId;
  session.mentorId = undefined;
  session.playerId = undefined;
  session.impersonating = undefined;
  session.originalUserId = undefined;
  await session.save();

  redirect("/admin/mentors");
}
