import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getISOWeek } from "@/lib/streak";
import { RichTextViewer } from "@/components/RichTextViewer";
import { ScopeForm } from "./ScopeForm";

export default async function ScopePage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const { weekNumber, year } = getISOWeek(new Date());

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
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Obiectiv săptămânal</h1>
        <p className="text-sm text-gray-400">
          Săptămâna {weekNumber}, {year}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 space-y-2">
        <p className="text-sm font-semibold">Obiectivul setat</p>
        {currentScope?.scope ? (
          <RichTextViewer html={currentScope.scope} className="text-sm" />
        ) : (
          <p className="text-sm text-gray-500">Nu ai setat încă un obiectiv pentru săptămâna aceasta.</p>
        )}
      </div>

      <ScopeForm currentScope={currentScope} pastScopes={pastScopes} />
    </div>
  );
}
