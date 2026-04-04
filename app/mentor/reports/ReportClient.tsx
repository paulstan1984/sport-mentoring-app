"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

      {data.rows.length > 0 && <ReportChart data={data} />}
    </div>
  );
}

// Palette for improvement way lines
const LINE_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6",
  "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#84cc16",
];

function confidenceScore(c: string | null): number | null {
  if (!c) return null;
  switch (c) {
    case "GOOD": return 3;
    case "OK": return 2;
    case "HARD": return 1;
    default: return null;
  }
}

function ReportChart({ data }: { data: ReportData }) {
  const chartData = data.rows.map((row) => {
    const point: Record<string, string | number | null> = { date: row.date };
    for (const iw of data.selectedImprovementWays) {
      point[`iw_${iw.id}`] = row.iwRatings[iw.id] ?? null;
    }
    if (data.includeConfidence) point["confidence"] = confidenceScore(row.confidence);
    if (data.includeJournalScore) point["journalScore"] = row.journalScore;
    if (data.includeWeeklyGoal) point["weeklyGoal"] = row.weeklyGoal;
    if (data.includeCheckinCount) point["checkinCount"] = row.checkinCount;
    return point;
  });

  return (
    <div className="mt-8 print:mt-6">
      <h3 className="text-base font-semibold mb-4">Grafic evoluție</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "confidence") {
                const labels: Record<number, string> = { 3: "Bine", 2: "OK", 1: "Greu" };
                return [labels[value] ?? value, "Nivel stare"];
              }
              return [value, name];
            }}
          />
          <Legend />

          {data.selectedImprovementWays.map((iw, idx) => (
            <Line
              key={iw.id}
              type="monotone"
              dataKey={`iw_${iw.id}`}
              name={iw.title}
              stroke={LINE_COLORS[idx % LINE_COLORS.length]}
              dot={false}
              connectNulls
            />
          ))}

          {data.includeConfidence && (
            <Line
              type="monotone"
              dataKey="confidence"
              name="Nivel stare"
              stroke="#6b7280"
              strokeDasharray="4 2"
              dot={false}
              connectNulls
            />
          )}

          {data.includeJournalScore && (
            <Line
              type="monotone"
              dataKey="journalScore"
              name="Scor jurnal"
              stroke="#0ea5e9"
              dot={false}
              connectNulls
            />
          )}

          {data.includeWeeklyGoal && (
            <Line
              type="monotone"
              dataKey="weeklyGoal"
              name="Obiectiv săpt."
              stroke="#22c55e"
              dot={false}
              connectNulls
            />
          )}

          {data.includeCheckinCount && (
            <Line
              type="monotone"
              dataKey="checkinCount"
              name="Checkin"
              stroke="#f97316"
              dot={false}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
