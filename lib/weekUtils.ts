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
 * Format: "21 mar. - 27 mar." (same month) or "28 mar. - 3 apr." (across months).
 * Both dates always include the month abbreviation.
 */
export function getWeekLabel(date: Date): string {
  const monday = getWeekStart(date);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  return `${fmt(monday)} - ${fmt(sunday)}`;
}

/**
 * Returns a human-friendly label for an ISO week identified by weekNumber and year.
 * Format: "21 mar. - 27 mar." or "28 mar. - 3 apr."
 * Jan 4 is always in ISO week 1 of its year.
 */
export function getWeekLabelFromWeekNumber(weekNumber: number, year: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // Mon=1..Sun=7
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1) + (weekNumber - 1) * 7);
  return getWeekLabel(monday);
}

/**
 * Returns the ISO week number and year for the given date.
 */
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
