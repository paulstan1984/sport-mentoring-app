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
    if (mentor) session.mentorId = mentor.id;
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
