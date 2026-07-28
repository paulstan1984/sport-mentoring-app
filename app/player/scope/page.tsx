import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getISOWeek, getWeekLabel } from "@/lib/streak";
import { RichTextViewer } from "@/components/RichTextViewer";
import { ScopeForm } from "./ScopeForm";

export default async function ScopePage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const { weekNumber, year } = getISOWeek(new Date());
  const weekLabel = getWeekLabel(new Date());

  const [currentScope, pastScopes] = await Promise.all([
    db.weeklyScope.findUnique({
      where: { playerId_weekNumber_year: { playerId, weekNumber, year } },
    }),
    db.weeklyScope.findMany({
      where: {
        playerId,
        OR: [{ year: { lt: year } }, { year, weekNumber: { lt: weekNumber } }],
      },
      orderBy: [{ year: "desc" }, { weekNumber: "desc" }],
      take: 10,
    }),
  ]);

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-display font-bold leading-tight mb-1" style={{ color: "var(--kit-text)" }}>
          Obiectiv săptămânal
        </h1>
        <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
          Săptămâna {weekLabel}
        </p>
      </div>

      <div
        className="rounded-2xl p-5 space-y-2"
        style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--kit-text-2)" }}>
          Obiectivul setat
        </p>
        {currentScope?.scope ? (
          <RichTextViewer html={currentScope.scope} className="text-sm" />
        ) : (
          <p className="text-sm" style={{ color: "var(--kit-text-2)" }}>
            Nu ai setat încă un obiectiv pentru săptămâna aceasta.
          </p>
        )}
      </div>

      <ScopeForm currentScope={currentScope} pastScopes={pastScopes} />
    </div>
  );
}
