import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReportClient } from "./ReportClient";
import type { ReportData, ReportRow, SelectedImprovementWay } from "./ReportClient";

// Returns all dates (UTC midnight) between startDate and endDate (inclusive)
function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

// Returns ISO week number and year for a UTC date
function getISOWeekInfo(date: Date): { weekNumber: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { weekNumber, year: d.getUTCFullYear() };
}

// Normalise a stored DateTime to YYYY-MM-DD string (UTC)
function toDateStr(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;
  const params = await searchParams;

  const [players, improvementWays] = await Promise.all([
    db.player.findMany({
      where: { mentorId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.improvementWay.findMany({
      where: { mentorId, deletedAt: null },
      orderBy: { order: "asc" },
    }),
  ]);

  // Determine whether a report has been requested
  const isReportRequested = !!params.playerId;

  const playerId = params.playerId ? Number(params.playerId) : null;
  const startDateStr = (params.startDate as string | undefined) ?? "";
  const endDateStr = (params.endDate as string | undefined) ?? "";

  // Checkbox defaults: checked when not yet submitted; use param values after submission
  const includeConfidence = !isReportRequested || params.includeConfidence === "1";
  const includeJournalScore = !isReportRequested || params.includeJournalScore === "1";
  const includeWeeklyGoal = !isReportRequested || params.includeWeeklyGoal === "1";
  const includeCheckinCount = !isReportRequested || params.includeCheckinCount === "1";

  // Improvement ways: default all selected; after submission use param values
  let selectedImprovementWayIds: number[];
  if (!isReportRequested) {
    selectedImprovementWayIds = improvementWays.map((iw) => iw.id);
  } else {
    const raw = params.improvementWays;
    const ids = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
    selectedImprovementWayIds = ids.map(Number).filter((n) => !isNaN(n));
  }

  let reportData: ReportData | null = null;

  if (isReportRequested && playerId && startDateStr && endDateStr) {
    // Validate player belongs to this mentor
    const player = await db.player.findFirst({
      where: { id: playerId, mentorId },
      select: { id: true, name: true },
    });

    if (player && startDateStr <= endDateStr) {
      const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
      const endDate = new Date(`${endDateStr}T00:00:00.000Z`);
      const dates = getDatesInRange(startDate, endDate);

      // Fetch all required data in parallel
      const [improvementRatings, confidenceLevels, dailyJournals, weeklyScopes, checkinAnswers] =
        await Promise.all([
          selectedImprovementWayIds.length > 0
            ? db.improvementWayRating.findMany({
                where: {
                  playerId,
                  improvementWayId: { in: selectedImprovementWayIds },
                  day: { gte: startDate, lte: new Date(`${endDateStr}T23:59:59.999Z`) },
                },
              })
            : Promise.resolve([]),
          includeConfidence
            ? db.confidenceLevel.findMany({
                where: {
                  playerId,
                  day: { gte: startDate, lte: new Date(`${endDateStr}T23:59:59.999Z`) },
                },
              })
            : Promise.resolve([]),
          includeJournalScore
            ? db.dailyJournal.findMany({
                where: {
                  playerId,
                  day: { gte: startDate, lte: new Date(`${endDateStr}T23:59:59.999Z`) },
                },
              })
            : Promise.resolve([]),
          includeWeeklyGoal
            ? db.weeklyScope.findMany({ where: { playerId } })
            : Promise.resolve([]),
          includeCheckinCount
            ? db.checkinAnswer.findMany({
                where: {
                  playerId,
                  checked: true,
                  day: { gte: startDate, lte: new Date(`${endDateStr}T23:59:59.999Z`) },
                },
              })
            : Promise.resolve([]),
        ]);

      const selectedImprovementWays: SelectedImprovementWay[] = improvementWays
        .filter((iw) => selectedImprovementWayIds.includes(iw.id))
        .map((iw) => ({ id: iw.id, title: iw.title }));

      const rows: ReportRow[] = dates.map((date) => {
        const dayStr = toDateStr(date);

        // Improvement way ratings for this day
        const iwRatings: Record<number, number> = {};
        for (const r of improvementRatings) {
          if (toDateStr(r.day) === dayStr) {
            iwRatings[r.improvementWayId] = r.score;
          }
        }

        // Confidence level
        let confidence: string | null = null;
        if (includeConfidence) {
          const cl = confidenceLevels.find((c) => toDateStr(c.day) === dayStr);
          confidence = cl?.level ?? null;
        }

        // Journal score
        let journalScore: number | null = null;
        if (includeJournalScore) {
          const j = dailyJournals.find((j) => toDateStr(j.day) === dayStr);
          journalScore = j?.myScore ?? null;
        }

        // Weekly goal: 5 if week is accomplished, otherwise 0
        let weeklyGoal: number | null = null;
        if (includeWeeklyGoal) {
          const { weekNumber, year } = getISOWeekInfo(date);
          const scope = weeklyScopes.find(
            (s) => s.weekNumber === weekNumber && s.year === year
          );
          weeklyGoal = scope?.accomplished ? 5 : 0;
        }

        // Checkin count — number of checked items for this day
        let checkinCount: number | null = null;
        if (includeCheckinCount) {
          checkinCount = checkinAnswers.filter((a) => toDateStr(a.day) === dayStr).length;
        }

        return { date: dayStr, iwRatings, confidence, journalScore, weeklyGoal, checkinCount };
      });

      reportData = {
        playerName: player.name,
        startDate: startDateStr,
        endDate: endDateStr,
        selectedImprovementWays,
        includeConfidence,
        includeJournalScore,
        includeWeeklyGoal,
        includeCheckinCount,
        rows,
      };
    }
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Rapoarte</h1>

      {/* Report configuration form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mb-8 print:hidden">
        <h2 className="text-lg font-semibold mb-4">Generează raport</h2>
        <form method="GET" action="/mentor/reports" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Jucător *</label>
              <select
                name="playerId"
                className="input"
                defaultValue={playerId ? String(playerId) : ""}
                required
              >
                <option value="">Selectează jucătorul</option>
                {players.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Data început *</label>
              <input
                type="date"
                name="startDate"
                className="input"
                defaultValue={startDateStr}
                required
              />
            </div>
            <div>
              <label className="label">Data sfârșit *</label>
              <input
                type="date"
                name="endDate"
                className="input"
                defaultValue={endDateStr}
                required
              />
            </div>
          </div>

          {/* Improvement ways selection */}
          {improvementWays.length > 0 && (
            <div>
              <p className="label mb-2">Căi de îmbunătățire</p>
              <div className="flex flex-wrap gap-3">
                {improvementWays.map((iw) => (
                  <label key={iw.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="improvementWays"
                      value={String(iw.id)}
                      defaultChecked={selectedImprovementWayIds.includes(iw.id)}
                      className="rounded"
                    />
                    {iw.title}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Section toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="includeConfidence"
                value="1"
                defaultChecked={includeConfidence}
                className="rounded"
              />
              Nivel de stare
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="includeJournalScore"
                value="1"
                defaultChecked={includeJournalScore}
                className="rounded"
              />
              Scor jurnal zilnic
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="includeWeeklyGoal"
                value="1"
                defaultChecked={includeWeeklyGoal}
                className="rounded"
              />
              Obiectiv săptămânal
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="includeCheckinCount"
                value="1"
                defaultChecked={includeCheckinCount}
                className="rounded"
              />
              Checkin efectuat
            </label>
          </div>

          <button type="submit" className="btn-primary">
            Generează raport
          </button>
        </form>
      </div>

      {/* Report output */}
      {reportData && <ReportClient data={reportData} />}
    </div>
  );
}
