import { db } from "./db";
export { getISOWeek, getWeekStart, getWeekLabel, getWeekLabelFromWeekNumber } from "./weekUtils";

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
