import { db } from "./db";

/** Returns the number of consecutive days (counting backwards from today)
 *  on which the player submitted at least one checkin answer. */
export async function getStreak(playerId: number): Promise<number> {
  const answers = await db.checkinAnswer.findMany({
    where: { playerId },
    select: { day: true },
    distinct: ["day"],
    orderBy: { day: "desc" },
  });

  if (answers.length === 0) return 0;

  const today = startOfDayUTC(new Date());
  let streak = 0;
  let expected = today.getTime();

  for (const { day } of answers) {
    const d = startOfDayUTC(new Date(day));
    if (d.getTime() === expected) {
      streak++;
      expected -= 86_400_000; // subtract one day in ms
    } else {
      break;
    }
  }

  return streak;
}

export function startOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function getISOWeek(date: Date): { weekNumber: number; year: number } {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7
  );
  return { weekNumber, year: d.getUTCFullYear() };
}

/**
 * Returns the Monday (start) of the ISO week that contains `date`.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dayNum = d.getUTCDay() || 7; // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() - (dayNum - 1));
  return d;
}

/**
 * Returns a human-friendly label for the week containing `date`.
 * Format: "21 Mar - 27 Mar" (same month) or "28 Mar - 3 Apr" (across months).
 */
export function getWeekLabel(date: Date): string {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const fmt = (d: Date, includeMonth: boolean) =>
    d.toLocaleDateString("ro-RO", {
      day: "numeric",
      ...(includeMonth ? { month: "short" } : {}),
      timeZone: "UTC",
    });

  const sameMonth = monday.getUTCMonth() === sunday.getUTCMonth();
  return `${fmt(monday, !sameMonth || true)} - ${fmt(sunday, true)}`;
}

