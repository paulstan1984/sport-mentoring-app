/**
 * Seed script — March 2026 report data for playerId = 1
 *
 * Run with:
 *   npx tsx prisma/seed-march-2026.ts
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const PLAYER_ID = 1;

// ── helpers ──────────────────────────────────────────────────────────────────

function utcDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

function getISOWeek(date: Date): { weekNumber: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { weekNumber, year: d.getUTCFullYear() };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Verify player exists and get their mentor
  const player = await db.player.findUnique({
    where: { id: PLAYER_ID },
    include: { mentor: true },
  });

  if (!player) {
    throw new Error(`Player with id=${PLAYER_ID} not found.`);
  }

  console.log(`✅ Found player: ${player.name} (mentor: ${player.mentor.name})`);

  const mentorId = player.mentorId;

  // Fetch improvement ways for this mentor
  const improvementWays = await db.improvementWay.findMany({
    where: { mentorId, deletedAt: null },
    orderBy: { order: "asc" },
  });
  console.log(`✅ Improvement ways (${improvementWays.length}): ${improvementWays.map((w) => w.title).join(", ")}`);

  // Fetch checkin form items for this mentor
  const checkinForm = await db.checkinForm.findUnique({
    where: { mentorId },
    include: { items: { where: { deletedAt: null }, orderBy: { order: "asc" } } },
  });
  const formItems = checkinForm?.items ?? [];
  console.log(`✅ Checkin form items: ${formItems.length}`);

  // All days in March 2026
  const start = utcDay(2026, 3, 1);
  const end = utcDay(2026, 3, 31);
  const days = getDatesInRange(start, end);

  // Track which ISO weeks we've already handled
  const seededWeeks = new Set<string>();

  let createdConfidence = 0;
  let createdJournal = 0;
  let createdCheckin = 0;
  let createdRatings = 0;
  let createdScopes = 0;

  for (const day of days) {
    // ── ConfidenceLevel ───────────────────────────────────────────────────
    const level = pick(["GOOD", "GOOD", "OK", "OK", "HARD"] as const);
    await db.confidenceLevel.upsert({
      where: { playerId_day: { playerId: PLAYER_ID, day } },
      update: { level },
      create: { playerId: PLAYER_ID, day, level },
    });
    createdConfidence++;

    // ── DailyJournal ──────────────────────────────────────────────────────
    const score = rand(5, 10);
    await db.dailyJournal.upsert({
      where: { playerId_day: { playerId: PLAYER_ID, day } },
      update: { myScore: score },
      create: {
        playerId: PLAYER_ID,
        day,
        whatDidGood: "Am respectat programul de antrenament.",
        whatDidWrong: score < 7 ? "Am întârziat la una din sesiuni." : null,
        whatCanDoBetter: "Hidratare mai bună în timpul zilei.",
        myScore: score,
      },
    });
    createdJournal++;

    // ── CheckinAnswers ────────────────────────────────────────────────────
    for (const item of formItems) {
      const checked = Math.random() > 0.25; // ~75% completion rate
      await db.checkinAnswer.upsert({
        where: { playerId_flagId_day: { playerId: PLAYER_ID, flagId: item.id, day } },
        update: { checked },
        create: { playerId: PLAYER_ID, flagId: item.id, day, checked },
      });
      createdCheckin++;
    }

    // ── ImprovementWayRatings ─────────────────────────────────────────────
    for (const iw of improvementWays) {
      const score = rand(3, 10);
      await db.improvementWayRating.upsert({
        where: { playerId_improvementWayId_day: { playerId: PLAYER_ID, improvementWayId: iw.id, day } },
        update: { score },
        create: { playerId: PLAYER_ID, improvementWayId: iw.id, day, score },
      });
      createdRatings++;
    }

    // ── WeeklyScope (once per ISO week) ───────────────────────────────────
    const { weekNumber, year } = getISOWeek(day);
    const weekKey = `${year}-W${weekNumber}`;
    if (!seededWeeks.has(weekKey)) {
      seededWeeks.add(weekKey);
      const accomplished = Math.random() > 0.35; // ~65% accomplished
      await db.weeklyScope.upsert({
        where: { playerId_weekNumber_year: { playerId: PLAYER_ID, weekNumber, year } },
        update: { accomplished },
        create: {
          playerId: PLAYER_ID,
          weekNumber,
          year,
          scope: `Obiectiv săptămâna ${weekNumber}: îmbunătățire tehnică și condiție fizică.`,
          accomplished,
        },
      });
      createdScopes++;
    }
  }

  console.log("\n🎉 Date pentru Martie 2026 generate cu succes!");
  console.log(`   Zile acoperite  : ${days.length}`);
  console.log(`   ConfidenceLevel : ${createdConfidence}`);
  console.log(`   DailyJournal    : ${createdJournal}`);
  console.log(`   CheckinAnswers  : ${createdCheckin}`);
  console.log(`   ImprovementWay  : ${createdRatings}`);
  console.log(`   WeeklyScope     : ${createdScopes}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
