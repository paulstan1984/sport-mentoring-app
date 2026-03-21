"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";

const SALT_ROUNDS = 12;

type ActionResult = { error?: string; success?: boolean };

// ── Mentors ───────────────────────────────────────────────────────────────────

export async function createMentor(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const photo = (formData.get("photo") as string)?.trim() || null;

  if (!username || !password || !name) {
    return { error: "Câmpurile marcate sunt obligatorii." };
  }
  if (password.length < 8) {
    return { error: "Parola trebuie să aibă cel puțin 8 caractere." };
  }

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "Utilizatorul există deja." };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await db.user.create({
    data: {
      username,
      passwordHash,
      role: "MENTOR",
      mentor: {
        create: { name, description, photo },
      },
    },
  });

  revalidatePath("/admin/mentors");
  return { success: true };
}

export async function updateMentor(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const photo = (formData.get("photo") as string)?.trim() || null;

  if (!id || !name) return { error: "Date invalide." };

  await db.mentor.update({
    where: { id },
    data: { name, description, photo },
  });

  revalidatePath("/admin/mentors");
  return { success: true };
}

export async function deleteMentor(id: number): Promise<ActionResult> {
  await requireSuperAdmin();
  await db.mentor.delete({ where: { id } });
  revalidatePath("/admin/mentors");
  return { success: true };
}

// ── Playfield Positions ───────────────────────────────────────────────────────

export async function createPosition(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Introduceți un nume." };

  const existing = await db.playfieldPosition.findUnique({ where: { name } });
  if (existing) return { error: "Această poziție există deja." };

  await db.playfieldPosition.create({ data: { name } });
  revalidatePath("/admin/positions");
  return { success: true };
}

export async function updatePosition(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  if (!id || !name) return { error: "Date invalide." };

  await db.playfieldPosition.update({ where: { id }, data: { name } });
  revalidatePath("/admin/positions");
  return { success: true };
}

export async function deletePosition(id: number): Promise<ActionResult> {
  await requireSuperAdmin();
  await db.playfieldPosition.delete({ where: { id } });
  revalidatePath("/admin/positions");
  return { success: true };
}
