import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlayerForm } from "./PlayerForm";
import { PlayerCsvImportToggle } from "./PlayerCsvImportToggle";
import { PlayerRow } from "./PlayerRow";

export default async function PlayersPage() {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;

  const [players, positions, labels] = await Promise.all([
    db.player.findMany({
      where: { mentorId },
      include: {
        user: { select: { username: true } },
        playfieldPosition: true,
      },
      orderBy: { name: "asc" },
    }),
    db.playfieldPosition.findMany({ orderBy: { name: "asc" } }),
    db.mentorLabel.findMany({ where: { mentorId }, select: { key: true, value: true } }),
  ]);

  const labelsMap = Object.fromEntries(labels.map((l) => [l.key, l.value]));
  const playerLabel = labelsMap["player"] ?? "Client";
  const playersLabel = labelsMap["players"] ?? "Clienți";

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{playersLabel}</h1>

      {/* Add player form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Adaugă {playerLabel}</h2>
        <PlayerForm positions={positions} playerLabel={playerLabel} />

        <PlayerCsvImportToggle />
      </div>

      {/* Players list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <tr>
              <th className="hidden sm:table-cell text-left px-4 py-3">Utilizator</th>
              <th className="text-left px-4 py-3">Nume</th>
              <th className="text-left px-4 py-3">Echipă</th>
              <th className="text-left px-4 py-3">Poziție</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {players.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Nu există {playersLabel.toLowerCase()}.
                </td>
              </tr>
            )}
            {players.map((p) => (
              <PlayerRow key={p.id} player={p} positions={positions} canImpersonate={session.impersonating === true} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
