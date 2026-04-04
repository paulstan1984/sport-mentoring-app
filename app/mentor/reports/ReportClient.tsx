"use client";

export interface ReportRow {
  date: string;
  iwRatings: Record<number, number>;
  confidence: string | null;
  journalScore: number | null;
  weeklyGoal: number | null;
  checkinCount: number | null;
}

export interface SelectedImprovementWay {
  id: number;
  title: string;
}

export interface ReportData {
  playerName: string;
  startDate: string;
  endDate: string;
  selectedImprovementWays: SelectedImprovementWay[];
  includeConfidence: boolean;
  includeJournalScore: boolean;
  includeWeeklyGoal: boolean;
  includeCheckinCount: boolean;
  rows: ReportRow[];
}

function confidenceLabel(c: string | null): string {
  if (!c) return "—";
  switch (c) {
    case "GOOD": return "Bine";
    case "OK": return "OK";
    case "HARD": return "Greu";
    default: return "—";
  }
}

export function ReportClient({ data }: { data: ReportData }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <h2 className="text-lg font-semibold">
          Raport: {data.playerName} ({data.startDate} → {data.endDate})
        </h2>
        <button onClick={() => window.print()} className="btn-primary">
          Exportă PDF
        </button>
      </div>

      {/* Print header — hidden on screen, visible on print */}
      <div className="hidden print:block mb-6">
        <h2 className="text-xl font-bold">SportMentor — Raport</h2>
        <p className="text-gray-600 mt-1">Jucător: {data.playerName}</p>
        <p className="text-gray-600">Perioadă: {data.startDate} – {data.endDate}</p>
      </div>

      {data.rows.length === 0 ? (
        <p className="text-gray-400 text-sm">Nu există date pentru perioada selectată.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                  Dată
                </th>
                {data.selectedImprovementWays.map((iw) => (
                  <th
                    key={iw.id}
                    className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold text-xs whitespace-nowrap"
                  >
                    {iw.title}
                  </th>
                ))}
                {data.includeConfidence && (
                  <th className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                    Nivel stare
                  </th>
                )}
                {data.includeJournalScore && (
                  <th className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                    Scor jurnal
                  </th>
                )}
                {data.includeWeeklyGoal && (
                  <th className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                    Obiectiv săpt.
                  </th>
                )}
                {data.includeCheckinCount && (
                  <th className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                    Checkin
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-3 py-2 border border-gray-200 dark:border-gray-700 font-mono text-xs whitespace-nowrap">
                    {row.date}
                  </td>
                  {data.selectedImprovementWays.map((iw) => (
                    <td
                      key={iw.id}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-center"
                    >
                      {row.iwRatings[iw.id] ?? "—"}
                    </td>
                  ))}
                  {data.includeConfidence && (
                    <td className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-center">
                      {confidenceLabel(row.confidence)}
                    </td>
                  )}
                  {data.includeJournalScore && (
                    <td className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-center">
                      {row.journalScore ?? "—"}
                    </td>
                  )}
                  {data.includeWeeklyGoal && (
                    <td className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-center">
                      {row.weeklyGoal}
                    </td>
                  )}
                  {data.includeCheckinCount && (
                    <td className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-center">
                      {row.checkinCount ?? "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
