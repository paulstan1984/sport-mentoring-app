import Link from "next/link";

interface CheckinHistoryProps {
  days: Date[];
  selectedDay: Date;
  page: number;
  hasNextPage: boolean;
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

export function CheckinHistory({ days, selectedDay, page, hasNextPage }: CheckinHistoryProps) {
  const selectedString = selectedDay.toISOString().slice(0, 10);
  const entries = days.filter((day) => dayParam(day) !== selectedString);

  if (entries.length === 0 && page === 1) return null;

  const pageHref = (pageNumber: number) =>
    `/player/checkin?day=${selectedString}&historyPage=${pageNumber}`;

  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
    >
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--kit-text-2)" }}>
        Istoric checkin
      </p>
      {entries.length > 0 ? (
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
      ) : (
        <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
          Nu există înregistrări pe această pagină.
        </p>
      )}
      <div className="flex items-center justify-between pt-1">
        {page > 1 ? (
          <Link href={pageHref(page - 1)} className="btn-secondary btn-xs">
            Anterior
          </Link>
        ) : (
          <span />
        )}
        <span className="text-xs" style={{ color: "var(--kit-text-3)" }}>
          Pagina {page}
        </span>
        {hasNextPage ? (
          <Link href={pageHref(page + 1)} className="btn-secondary btn-xs">
            Următoarea
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
