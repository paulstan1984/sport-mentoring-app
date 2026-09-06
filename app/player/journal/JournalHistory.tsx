import Link from "next/link";
import type { DailyJournal } from "@/app/generated/prisma/client";

interface JournalHistoryProps {
  history: DailyJournal[];
  selectedDay: Date;
}

function formatDay(date: Date | string): string {
  return new Date(date).toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function dayParam(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export function JournalHistory({ history, selectedDay }: JournalHistoryProps) {
  const selectedString = selectedDay.toISOString().slice(0, 10);
  const entries = history.filter(
    (entry) => dayParam(entry.day) !== selectedString
  );

  if (entries.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
    >
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--kit-text-2)" }}>
        Istoric jurnal
      </p>
      <div className="space-y-2">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/player/journal?day=${dayParam(entry.day)}`}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: "var(--kit-surface-2)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--kit-text)" }}>
              {formatDay(entry.day)}
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--kit-text-3)" }}>
              Scor: {entry.myScore}/5
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
