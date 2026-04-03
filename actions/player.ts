"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePlayer, getSession } from "@/lib/auth";
import { startOfDayUTC, getISOWeek } from "@/lib/streak";
import type { Confidence } from "@/app/generated/prisma/client";

const SALT_ROUNDS = 12;
type ActionResult = { error?: string; success?: boolean };

async function getPlayerId(): Promise<number> {
  const session = await getSession();
  if (!session.playerId) throw new Error("Not a player");
  return session.playerId;
}

// ── Checkin ───────────────────────────────────────────────────────────────────

export async function submitCheckin(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requirePlayer();
  const playerId = await getPlayerId();

  const today = startOfDayUTC(new Date());

  // Find mentor's active form items
  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      mentor: {
        include: {
          checkinForm: {
            include: {
              items: {
                where: { deletedAt: null },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!player?.mentor.checkinForm) return { error: "Formularul nu este disponibil." };

  const items = player.mentor.checkinForm.items;

  const ops = items.map((item) => {
    const checked = formData.get(`flag_${item.id}`) === "on";
    const stringValue =
      item.allowAdditionalString && checked
        ? ((formData.get(`string_${item.id}`) as string) ?? null)
        : null;

    return db.checkinAnswer.upsert({
      where: {
        playerId_flagId_day: { playerId, flagId: item.id, day: today },
      },
      update: { checked, stringValue },
      create: { playerId, flagId: item.id, day: today, checked, stringValue },
    });
  });

  await db.$transaction(ops);

  revalidatePath("/player/checkin");
  revalidatePath("/player/dashboard");
  return { success: true };
}

// ── Journal ───────────────────────────────────────────────────────────────────

export async function submitJournal(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requirePlayer();
  const playerId = await getPlayerId();

  const today = startOfDayUTC(new Date());
  const whatDidGood = (formData.get("whatDidGood") as string) || null;
  const whatDidWrong = (formData.get("whatDidWrong") as string) || null;
  const whatCanDoBetter = (formData.get("whatCanDoBetter") as string) || null;
  const myScore = Math.min(5, Math.max(0, Number(formData.get("myScore")) || 0));

  await db.dailyJournal.upsert({
    where: { playerId_day: { playerId, day: today } },
    update: { whatDidGood, whatDidWrong, whatCanDoBetter, myScore },
    create: {
      playerId,
      day: today,
      whatDidGood,
      whatDidWrong,
      whatCanDoBetter,
      myScore,
    },
  });

  revalidatePath("/player/journal");
  revalidatePath("/player/dashboard");
  return { success: true };
}

// ── Weekly Scope ──────────────────────────────────────────────────────────────

export async function saveWeeklyScope(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requirePlayer();
  const playerId = await getPlayerId();

  const scope = (formData.get("scope") as string) || null;
  const { weekNumber, year } = getISOWeek(new Date());

  await db.weeklyScope.upsert({
    where: { playerId_weekNumber_year: { playerId, weekNumber, year } },
    update: { scope },
    create: { playerId, weekNumber, year, scope },
  });

  revalidatePath("/player/scope");
  revalidatePath("/player/dashboard");
  return { success: true };
}

export async function toggleWeeklyScope(
  id: number,
  accomplished: boolean
): Promise<ActionResult> {
  await requirePlayer();
  const playerId = await getPlayerId();

  const scope = await db.weeklyScope.findFirst({ where: { id, playerId } });
  if (!scope) return { error: "Obiectivul nu a fost găsit." };

  await db.weeklyScope.update({ where: { id }, data: { accomplished } });
  revalidatePath("/player/scope");
  revalidatePath("/player/dashboard");
  return { success: true };
}

// ── Confidence ────────────────────────────────────────────────────────────────

export async function setConfidenceLevel(
  level: Confidence
): Promise<ActionResult> {
  await requirePlayer();
  const playerId = await getPlayerId();

  const today = startOfDayUTC(new Date());

  await db.confidenceLevel.upsert({
    where: { playerId_day: { playerId, day: today } },
    update: { level },
    create: { playerId, day: today, level },
  });

  revalidatePath("/player/dashboard");
  return { success: true };
}

// ── Library Read ──────────────────────────────────────────────────────────────

export async function markLibraryItemRead(
  libraryItemId: number
): Promise<ActionResult> {
  await requirePlayer();
  const playerId = await getPlayerId();

  // Verify item belongs to player's mentor
  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player) return { error: "Jucător negăsit." };

  const item = await db.libraryItem.findFirst({
    where: { id: libraryItemId, mentorId: player.mentorId },
  });
  if (!item) return { error: "Element negăsit." };

  await db.libraryItemRead.upsert({
    where: { libraryItemId_playerId: { libraryItemId, playerId } },
    update: {},
    create: { libraryItemId, playerId },
  });

  return { success: true };
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function updatePlayerObjective(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requirePlayer();
  const playerId = await getPlayerId();

  const objective = (formData.get("objective") as string) || null;

  await db.player.update({ where: { id: playerId }, data: { objective } });
  revalidatePath("/player/profile");
  revalidatePath("/player/dashboard");
  return { success: true };
}

export async function changePlayerPassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requirePlayer();
  const session = await getSession();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword)
    return { error: "Completați toate câmpurile." };
  if (newPassword.length < 8)
    return { error: "Parola nouă trebuie să aibă cel puțin 8 caractere." };

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Utilizator negăsit." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Parola curentă este greșită." };

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}

// ── Update last_active_at ─────────────────────────────────────────────────────

export async function touchPlayerActivity(): Promise<void> {
  const session = await getSession();
  if (!session.playerId) return;
  await db.player.update({
    where: { id: session.playerId },
    data: { lastActiveAt: new Date() },
  });
}

// ── Improvement Way Ratings ───────────────────────────────────────────────────

export async function saveImprovementWayRatings(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requirePlayer();
  const playerId = await getPlayerId();

  const today = startOfDayUTC(new Date());

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      mentor: {
        include: {
          improvementWays: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!player) return { error: "Jucător negăsit." };

  const ways = player.mentor.improvementWays;

  const ops = ways.map((way) => {
    const raw = formData.get(`score_${way.id}`);
    const score = Math.min(5, Math.max(1, Number(raw) || 1));

    return db.improvementWayRating.upsert({
      where: {
        playerId_improvementWayId_day: { playerId, improvementWayId: way.id, day: today },
      },
      update: { score },
      create: { playerId, improvementWayId: way.id, day: today, score },
    });
  });

  await db.$transaction(ops);

  revalidatePath("/player/improvement");
  revalidatePath("/player/dashboard");
  return { success: true };
}
