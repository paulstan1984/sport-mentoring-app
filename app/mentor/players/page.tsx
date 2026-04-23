import Link from "next/link";
import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlayerForm } from "./PlayerForm";
import { PlayerCsvImportToggle } from "./PlayerCsvImportToggle";
import { PlayerRow } from "./PlayerRow";
import { PLAYER_LIMITS } from "@/lib/playerLimits";

export default async function PlayersPage() {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;

  const [players, positions, labels, mentor] = await Promise.all([
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
    db.mentor.findUnique({ where: { id: mentorId }, select: { level: true } }),
  ]);

  const labelsMap = Object.fromEntries(labels.map((l) => [l.key, l.value]));
  const playerLabel = labelsMap["player"] ?? "Client";
  const playersLabel = labelsMap["players"] ?? "Clienți";

  const playerLimit = mentor ? PLAYER_LIMITS[mentor.level] : null;
  const atLimit = playerLimit !== null && players.length >= playerLimit;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{playersLabel}</h1>

      {/* Player limit indicator */}
      {playerLimit !== null && (
        <div
          className={`rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2 ${
            atLimit
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
              : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
          }`}
        >
          {atLimit ? (
            <>
              <span>
                Ai atins limita de <strong>{playerLimit}</strong> {playersLabel.toLowerCase()} pentru nivelul tău.
                Solicită un upgrade din secțiunea{" "}
                <Link href="/mentor/profile" className="underline font-medium">
                  Profil
                </Link>{" "}
                pentru a adăuga mai mulți.
              </span>
            </>
          ) : (
            <span>
              {playersLabel}: <strong>{players.length}</strong> / <strong>{playerLimit}</strong>
            </span>
          )}
        </div>
      )}

      {/* Add player form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Adaugă {playerLabel}</h2>
        {atLimit ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Limita de {playerLimit} {playersLabel.toLowerCase()} a fost atinsă. Solicită un upgrade pentru a adăuga mai mulți.
          </p>
        ) : (
          <>
            <PlayerForm positions={positions} playerLabel={playerLabel} />
            <PlayerCsvImportToggle />
          </>
        )}
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
