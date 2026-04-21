import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStreak } from "@/lib/streak";
import { PresenceBadge } from "@/components/PresenceBadge";
import { PlayerProfileEditor } from "./PlayerProfileEditor";
import { PlayerNotes } from "./PlayerNotes";
import { PlayerSections } from "./PlayerSections";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;
  const { id } = await params;
  const playerId = Number(id);

  const player = await db.player.findFirst({
    where: { id: playerId, mentorId },
    include: {
      user: { select: { username: true } },
      playfieldPosition: true,
      checkinAnswers: {
        include: { flag: true },
        orderBy: { day: "desc" },
        take: 500,
      },
      dailyJournals: { orderBy: { day: "desc" }, take: 100 },
      weeklyScopes: { orderBy: [{ year: "desc" }, { weekNumber: "desc" }], take: 100 },
      confidenceLevels: { orderBy: { day: "desc" }, take: 100 },
      libraryReads: { include: { libraryItem: true } },
      notes: { orderBy: { date: "desc" } },
    },
  });

  if (!player) notFound();

  const streak = await getStreak(playerId);

  const checkinsByDay = player.checkinAnswers.reduce<
    Array<{ dayKey: string; answers: typeof player.checkinAnswers }>
  >((acc, answer) => {
    const dayKey = new Date(answer.day).toISOString().slice(0, 10);
    const existingGroup = acc.find((group) => group.dayKey === dayKey);

    if (existingGroup) {
      existingGroup.answers.push(answer);
    } else {
      acc.push({ dayKey, answers: [answer] });
    }

    return acc;
  }, []);

  // Library items for this mentor + read status
  const [libraryItems, positions, improvementWays] = await Promise.all([
    db.libraryItem.findMany({
      where: { mentorId },
      include: {
        reads: { where: { playerId } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.playfieldPosition.findMany({ orderBy: { name: "asc" } }),
    db.improvementWay.findMany({
      where: { mentorId, deletedAt: null },
      include: {
        ratings: {
          where: { playerId },
          orderBy: { day: "desc" },
          take: 100,
        },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {player.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.photo}
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {player.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-2xl font-bold">{player.name}</h1>
            <PresenceBadge lastActiveAt={player.lastActiveAt} />
            {!player.isActive && (
              <span className="rounded bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                dezactivat
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            @{player.user.username}
            {player.team && ` · ${player.team}`}
            {player.playfieldPosition && ` · ${player.playfieldPosition.name}`}
          </p>
        </div>
        <div className="text-center bg-blue-50 dark:bg-blue-950 rounded-xl px-4 py-2">
          <p className="text-2xl font-bold text-blue-600">{streak}</p>
          <p className="text-xs text-gray-400">zile consecutiv</p>
        </div>
      </div>

      <PlayerProfileEditor
        player={{
          id: player.id,
          name: player.name,
          team: player.team,
          dateOfBirth: player.dateOfBirth,
          playfieldPositionId: player.playfieldPositionId,
        }}
        positions={positions}
      />

      {/* Mentor notes for this player */}
      <PlayerNotes playerId={player.id} notes={player.notes} />

      <PlayerSections
        playerId={player.id}
        confidenceLevels={player.confidenceLevels}
        checkinsByDay={checkinsByDay}
        dailyJournals={player.dailyJournals}
        weeklyScopes={player.weeklyScopes}
        improvementWays={improvementWays}
        libraryItems={libraryItems}
      />

      <div className="flex">
        <Link href="/mentor/players" className="btn-secondary text-sm">
          ← Înapoi la jucători
        </Link>
      </div>
    </div>
  );
}
