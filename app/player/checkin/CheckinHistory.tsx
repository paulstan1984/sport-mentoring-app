import Link from "next/link";

interface CheckinHistoryProps {
  days: Date[];
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

export function CheckinHistory({ days, selectedDay }: CheckinHistoryProps) {
  const selectedString = selectedDay.toISOString().slice(0, 10);
  const entries = days.filter((day) => dayParam(day) !== selectedString);

  if (entries.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
    >
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--kit-text-2)" }}>
        Istoric checkin
      </p>
      <div className="space-y-2">
        {entries.map((day) => (
          <Link
            key={dayParam(day)}
            href={`/player/checkin?day=${dayParam(day)}`}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: "var(--kit-surface-2)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--kit-text)" }}>
              {formatDay(day)}
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--kit-text-3)" }}>
              Editează
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
