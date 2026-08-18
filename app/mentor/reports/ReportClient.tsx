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

export interface PlayerNoteRow {
  id: number;
  date: string;
  checkinPresence: boolean;
  content: string;
}

export interface ReportData {
  playerName: string;
  startDate: string;
  endDate: string;
  playerLabel: string;
  selectedImprovementWays: SelectedImprovementWay[];
  includeConfidence: boolean;
  includeJournalScore: boolean;
  includeWeeklyGoal: boolean;
  includeCheckinCount: boolean;
  includePlayerNotes: boolean;
  rows: ReportRow[];
  playerNotes: PlayerNoteRow[];
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

async function exportToPdf(
  reportId: string,
  playerName: string,
  startDate: string,
  endDate: string
) {
  const el = document.getElementById(reportId);
  if (!el) return;

  const { default: html2pdf } = await import("html2pdf.js");

  // Clone the report so we don't modify the UI
  const clone = el.cloneNode(true) as HTMLElement;

  // Remove elements that shouldn't be included in the PDF
  clone.querySelectorAll("[data-print-exclude]").forEach((element) => {
    element.remove();
  });

  // Create a temporary container
  const container = document.createElement("div");

  container.style.position = "absolute";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "1120px";
  container.style.background = "#fff";
  container.style.padding = "0";

  container.appendChild(clone);
  document.body.appendChild(container);

  const options = {
    enableLinks: true,
    margin: [12, 12, 12, 12] as [number, number, number, number],
    filename: `Raport-${playerName}-${startDate}-${endDate}.pdf`,
    image: {
      type: "jpeg" as "jpeg" | "png" | "webp",
      quality: 0.98,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "landscape" as "portrait" | "landscape",
    }
  };

  html2pdf()
    .set(options)
    .from(clone)
    .outputPdf("blob")
    .then((pdfBlob: Blob) => {
      // Remove temporary DOM element
      document.body.removeChild(container);

      // Open the generated PDF in a new browser tab
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const pdfWindow = window.open(pdfUrl, "_blank");

      if (!pdfWindow) {
        console.warn("Popup blocked by browser");
      }

      // Give the browser time to load the PDF before releasing the URL
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60000);
    })
    .catch((error: unknown) => {
      document.body.removeChild(container);
      console.error("PDF generation failed:", error);
    });
}

export function ReportClient({ data }: { data: ReportData }) {
  const reportId = "report-content";
  return (
    <div id={reportId} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
      <div data-print-exclude className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Raport: {data.playerName} ({data.startDate} → {data.endDate})
        </h2>
        <button
          onClick={() => exportToPdf(reportId, data.playerName, data.startDate, data.endDate)}
          className="btn-primary"
        >
          Exportă PDF
        </button>
      </div>

      {/* Print header — shown inside the cloned window */}
      <div className="mb-2">
        <p className="text-gray-500 text-sm">
          {data.playerLabel}: <span className="font-medium text-gray-800 dark:text-gray-100">{data.playerName}</span>
          &nbsp;·&nbsp;Perioadă: {data.startDate} – {data.endDate}
        </p>
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
                    className="text-center px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold text-xs whitespace-nowrap"
                  >
                    {iw.title}
                  </th>
                ))}
                {data.includeConfidence && (
                  <th className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                    Nivel încredere
                  </th>
                )}
                {data.includeJournalScore && (
                  <th className="text-center px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                    Scor jurnal
                  </th>
                )}
                {data.includeWeeklyGoal && (
                  <th className="text-center px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                    Obiectiv săpt.
                  </th>
                )}
                {data.includeCheckinCount && (
                  <th className="text-center px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
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

      {data.rows.length > 0 && (
        <div className="print-chart">
          <ReportChart data={data} />
        </div>
      )}

      {/* Player notes table */}
      {data.includePlayerNotes && (
        <div className="mt-8">
          <h3 className="text-base font-semibold mb-3">Notițe mentor</h3>
          {data.playerNotes.length === 0 ? (
            <p className="text-sm text-gray-400">Nu există notițe pentru perioada selectată.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">Dată</th>
                    <th className="text-center px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">Checkin (Prezența)</th>
                    <th className="text-left px-3 py-2 border border-gray-200 dark:border-gray-700 font-semibold">Mesaj notă</th>
                  </tr>
                </thead>
                <tbody>
                  {data.playerNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 align-top">
                      <td className="px-3 py-2 border border-gray-200 dark:border-gray-700 font-mono text-xs whitespace-nowrap">
                        {note.date}
                      </td>
                      <td className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-center">
                        {note.checkinPresence ? (
                          <span className="text-green-600 font-medium">✅ Prezent</span>
                        ) : (
                          <span className="text-gray-400">⬜ Absent</span>
                        )}
                      </td>
                      <td style={{
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        verticalAlign: 'top',
                      }}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-xs"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, name: string) => {
              if (name === "confidence") {
                const labels: Record<number, string> = { 3: "Bine", 2: "OK", 1: "Greu" };
                return [typeof value === "number" ? (labels[value] ?? value) : value, "Nivel încredere"];
              }
              return [value, name];
            }) as any}
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
              name="Nivel încredere"
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
