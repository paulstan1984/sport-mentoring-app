"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { SignupRequestStatus, RequestType, MentorLevel } from "@/app/generated/prisma/client";
import { requireSuperAdmin, getSession } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_SIZE_BYTES,
  saveUploadedFile,
  deleteFile,
  deleteMentorUploadDir,
  resolveMentorPhotoPath,
} from "@/lib/upload";

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

  const user = await db.user.create({
    data: {
      username,
      passwordHash,
      role: "MENTOR",
      mentor: {
        create: {
          name,
          description,
          photo: null,
          labels: {
            create: [
              { key: "players", value: "Clienți" },
              { key: "player", value: "Client" },
            ],
          },
        },
      },
    },
    include: { mentor: true },
  });

  // Handle optional photo upload
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > MAX_SIZE_BYTES) {
      revalidatePath("/admin/mentors");
      return { success: true, error: "Mentorul a fost adăugat, dar fotografia depășește 20 MB și nu a fost salvată." };
    }
    const ext = ALLOWED_IMAGE_TYPES[photoFile.type];
    if (!ext) {
      revalidatePath("/admin/mentors");
      return { success: true, error: "Mentorul a fost adăugat, dar tipul fotografiei nu este acceptat (JPG, PNG, GIF)." };
    }
    if (user.mentor) {
      const { filename } = await saveUploadedFile(photoFile, user.mentor.id, ext);
      const photoUrl = `/api/mentor-photo/${user.mentor.id}/${filename}`;
      await db.mentor.update({
        where: { id: user.mentor.id },
        data: { photo: photoUrl },
      });
    }
  }

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

  if (!id || !name) return { error: "Date invalide." };

  // Handle optional photo upload
  const photoFile = formData.get("photo") as File | null;
  let photo: string | null | undefined = undefined; // undefined = keep existing

  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > MAX_SIZE_BYTES) {
      return { error: "Fotografia depășește limita de 20 MB." };
    }
    const ext = ALLOWED_IMAGE_TYPES[photoFile.type];
    if (!ext) {
      return { error: "Tipul fotografiei nu este acceptat (JPG, PNG, GIF)." };
    }

    // Delete old photo if stored locally
    const existing = await db.mentor.findUnique({ where: { id }, select: { photo: true } });
    if (existing) {
      const oldPath = resolveMentorPhotoPath(existing.photo);
      if (oldPath) await deleteFile(oldPath);
    }

    const { filename } = await saveUploadedFile(photoFile, id, ext);
    photo = `/api/mentor-photo/${id}/${filename}`;
  }

  await db.mentor.update({
    where: { id },
    data: {
      name,
      description,
      ...(photo !== undefined ? { photo } : {}),
    },
  });

  revalidatePath("/admin/mentors");
  return { success: true };
}

export async function deleteMentor(id: number): Promise<ActionResult> {
  await requireSuperAdmin();

  // Gather files to delete before removing DB records
  const mentor = await db.mentor.findUnique({
    where: { id },
    include: { libraryItems: { select: { filePath: true } } },
  });

  if (mentor) {
    // Delete library item files
    for (const item of mentor.libraryItems) {
      await deleteFile(item.filePath);
    }
    // Delete profile photo file if stored locally
    const photoPath = resolveMentorPhotoPath(mentor.photo);
    if (photoPath) {
      await deleteFile(photoPath);
    }
    // Remove the entire mentor upload directory (catches any remaining files)
    await deleteMentorUploadDir(id);
  }

  await db.mentor.delete({ where: { id } });
  revalidatePath("/admin/mentors");
  return { success: true };
}


export async function toggleMentorActive(id: number): Promise<ActionResult> {
  await requireSuperAdmin();

  const mentor = await db.mentor.findUnique({ where: { id }, select: { isActive: true } });
  if (!mentor) return { error: "Mentorul nu a fost găsit." };

  await db.mentor.update({ where: { id }, data: { isActive: !mentor.isActive } });
  revalidatePath("/admin/mentors");
  return { success: true };
}

export async function changeMentorPassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const id = Number(formData.get("id"));
  const newPassword = formData.get("newPassword") as string;

  if (!id || !newPassword) return { error: "Date invalide." };
  if (newPassword.length < 8) return { error: "Parola trebuie să aibă cel puțin 8 caractere." };

  const mentor = await db.mentor.findUnique({ where: { id }, select: { userId: true } });
  if (!mentor) return { error: "Mentorul nu a fost găsit." };

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.user.update({ where: { id: mentor.userId }, data: { passwordHash } });

  return { success: true };
}



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

// ── Super Admin Profile ────────────────────────────────────────────────────────

export async function updateSuperAdminProfile(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSuperAdmin();

  const username = (formData.get("username") as string)?.trim();
  if (!username) return { error: "Utilizatorul este obligatoriu." };

  const existing = await db.user.findUnique({ where: { username } });
  if (existing && existing.id !== session.userId) {
    return { error: "Utilizatorul există deja." };
  }

  await db.user.update({ where: { id: session.userId }, data: { username } });
  revalidatePath("/admin/profile");
  return { success: true };
}

export async function changeSuperAdminPassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSuperAdmin();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) return { error: "Completați toate câmpurile." };
  if (newPassword.length < 8) return { error: "Parola nouă trebuie să aibă cel puțin 8 caractere." };

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Utilizator negăsit." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Parola curentă este greșită." };

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}

// ── Admin Requests (signups & level upgrades) ─────────────────────────────────

export async function approveMentorSignup(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const requestId = Number(formData.get("requestId"));
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!requestId || !username || !password) {
    return { error: "Câmpurile marcate sunt obligatorii." };
  }
  if (password.length < 8) {
    return { error: "Parola trebuie să aibă cel puțin 8 caractere." };
  }

  const request = await db.adminRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== SignupRequestStatus.PENDING) {
    return { error: "Cererea nu a fost găsită sau a fost deja procesată." };
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
        create: {
          name: request.name ?? username,
          description: request.description,
          photo: null,
          labels: {
            create: [
              { key: "players", value: "Clienți" },
              { key: "player", value: "Client" },
            ],
          },
        },
      },
    },
  });

  await db.adminRequest.update({
    where: { id: requestId },
    data: { status: SignupRequestStatus.APPROVED, processedAt: new Date() },
  });

  revalidatePath("/admin/signups");
  revalidatePath("/admin/mentors");
  return { success: true };
}

export async function approveLevelUpgradeRequest(requestId: number): Promise<ActionResult> {
  await requireSuperAdmin();

  const request = await db.adminRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== SignupRequestStatus.PENDING || request.requestType !== RequestType.LEVEL_UPGRADE) {
    return { error: "Cererea nu a fost găsită sau a fost deja procesată." };
  }
  if (!request.mentorId || !request.requestedLevel) {
    return { error: "Date invalide în cerere." };
  }

  await db.mentor.update({
    where: { id: request.mentorId },
    data: { level: request.requestedLevel },
  });

  await db.adminRequest.update({
    where: { id: requestId },
    data: { status: SignupRequestStatus.APPROVED, processedAt: new Date() },
  });

  revalidatePath("/admin/signups");
  revalidatePath("/admin/mentors");
  return { success: true };
}

export async function rejectMentorSignup(requestId: number): Promise<ActionResult> {
  await requireSuperAdmin();

  const request = await db.adminRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== SignupRequestStatus.PENDING) {
    return { error: "Cererea nu a fost găsită sau a fost deja procesată." };
  }

  await db.adminRequest.update({
    where: { id: requestId },
    data: { status: SignupRequestStatus.REJECTED, processedAt: new Date() },
  });

  revalidatePath("/admin/signups");
  return { success: true };
}

export async function changeMentorLevel(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const id = Number(formData.get("id"));
  const level = formData.get("level") as string;

  const validLevels: string[] = ["FREE", "MINIMUM", "MEDIUM", "PRO", "ENTERPRISE"];
  if (!id || !validLevels.includes(level)) return { error: "Date invalide." };

  await db.mentor.update({ where: { id }, data: { level: level as MentorLevel } });
  revalidatePath("/admin/mentors");
  return { success: true };
}


// ── Tools ─────────────────────────────────────────────────────────────────────

export async function deleteOrphanUsers(): Promise<ActionResult & { count?: number }> {
  await requireSuperAdmin();

  const result = await db.$executeRaw`
    DELETE FROM "User"
    WHERE role != 'SUPER_ADMIN'
      AND id NOT IN (SELECT userId FROM "Mentor")
      AND id NOT IN (SELECT userId FROM "Player")
  `;

  return { success: true, count: result };
}
