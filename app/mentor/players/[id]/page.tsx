import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStreak } from "@/lib/streak";
import { getWeekLabelFromWeekNumber } from "@/lib/weekUtils";
import { RichTextViewer } from "@/components/RichTextViewer";
import { PresenceBadge } from "@/components/PresenceBadge";
import { PlayerProfileEditor } from "./PlayerProfileEditor";
import { PlayerNotes } from "./PlayerNotes";

const CONFIDENCE_LABEL: Record<string, string> = {
  GOOD: "😊 Bine",
  OK: "😐 OK",
  HARD: "😓 Greu",
};

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
        take: 50,
      },
      dailyJournals: { orderBy: { day: "desc" }, take: 10 },
      weeklyScopes: { orderBy: { year: "desc" }, take: 8 },
      confidenceLevels: { orderBy: { day: "desc" }, take: 14 },
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
          take: 14,
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

      {/* Confidence history */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <h2 className="font-semibold mb-3">Nivelul de încredere (ultimele 14 zile)</h2>
        <div className="flex gap-2 flex-wrap">
          {player.confidenceLevels.map((c) => (
            <span key={c.id} className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
              {new Date(c.day).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}:{" "}
              {CONFIDENCE_LABEL[c.level]}
            </span>
          ))}
          {player.confidenceLevels.length === 0 && (
            <p className="text-sm text-gray-400">Nicio înregistrare.</p>
          )}
        </div>
      </div>

      {/* Checkin records */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <h2 className="font-semibold mb-4">Checkin (ultimele înregistrări)</h2>
        <div className="space-y-4">
          {checkinsByDay.length === 0 && (
            <p className="text-sm text-gray-400">Nicio înregistrare.</p>
          )}

          {checkinsByDay.map((group) => {
            const checkedCount = group.answers.filter((a) => a.checked).length;

            return (
              <div key={group.dayKey} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                <p className="text-xs font-medium text-gray-400 mb-2">
                  {new Date(group.dayKey).toLocaleDateString("ro-RO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  {checkedCount}/{group.answers.length} bifate
                </p>

                <div className="space-y-1">
                  {group.answers.map((answer) => (
                    <div key={answer.id} className="text-sm flex items-start gap-2">
                      <span className={answer.checked ? "text-green-500" : "text-gray-400"}>
                        {answer.checked ? "✅" : "⬜"}
                      </span>
                      <div>
                        <span>{answer.flag.label}</span>
                        {answer.stringValue && (
                          <p className="text-xs text-gray-500 mt-0.5">Detalii: {answer.stringValue}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Journal history */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <h2 className="font-semibold mb-4">Jurnal (ultimele 10 zile)</h2>
        <div className="space-y-4">
          {player.dailyJournals.length === 0 && (
            <p className="text-sm text-gray-400">Nicio înregistrare.</p>
          )}
          {player.dailyJournals.map((j) => (
            <div key={j.id} className="border-l-4 border-blue-400 pl-4">
              <p className="text-xs font-medium text-gray-400 mb-2">
                {new Date(j.day).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}
                {" · "}Scor: {j.myScore}/5
              </p>
              {j.whatDidGood && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-green-600 mb-1">Ce am făcut bine:</p>
                  <RichTextViewer html={j.whatDidGood} className="text-sm" />
                </div>
              )}
              {j.whatDidWrong && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-red-500 mb-1">Ce am greșit:</p>
                  <RichTextViewer html={j.whatDidWrong} className="text-sm" />
                </div>
              )}
              {j.whatCanDoBetter && (
                <div>
                  <p className="text-xs font-semibold text-orange-500 mb-1">Ce pot face mai bine:</p>
                  <RichTextViewer html={j.whatCanDoBetter} className="text-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly scopes */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <h2 className="font-semibold mb-3">Obiective săptămânale</h2>
        <div className="space-y-3">
          {player.weeklyScopes.length === 0 && (
            <p className="text-sm text-gray-400">Nicio înregistrare.</p>
          )}
          {player.weeklyScopes.map((s) => (
            <div key={s.id} className="flex items-start gap-3">
              <span className="text-xs text-gray-400 shrink-0 mt-1">
                Săpt. {getWeekLabelFromWeekNumber(s.weekNumber, s.year)}
              </span>
              <div className="flex-1">
                <RichTextViewer html={s.scope} className="text-sm" />
              </div>
              <span className={`text-xs shrink-0 ${s.accomplished === true ? "text-green-500" : s.accomplished === false ? "text-red-500" : "text-gray-400"}`}>
                {s.accomplished === true ? "✅ Realizat" : s.accomplished === false ? "❌ Nerealizat" : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement way ratings */}
      {improvementWays.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
          <h2 className="font-semibold mb-4">Modalități de îmbunătățire (ultimele 14 zile)</h2>
          <div className="space-y-5">
            {improvementWays.map((way) => (
              <div key={way.id}>
                <p className="text-sm font-medium mb-2">{way.title}</p>
                {way.ratings.length === 0 ? (
                  <p className="text-xs text-gray-400">Nicio evaluare.</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {way.ratings.map((r) => (
                      <span
                        key={r.id}
                        className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1"
                      >
                        {new Date(r.day).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                        })}
                        {": "}
                        <span className="font-semibold text-blue-600">{r.score}/5</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library read status */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <h2 className="font-semibold mb-3">Bibliotecă — status citire</h2>
        <div className="space-y-2">
          {libraryItems.length === 0 && (
            <p className="text-sm text-gray-400">Nu există materiale în bibliotecă.</p>
          )}
          {libraryItems.map((item) => {
            const read = item.reads.length > 0;
            return (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span className={read ? "text-green-500" : "text-gray-400"}>
                  {read ? "✅" : "⬜"}
                </span>
                <span>{item.name}</span>
                {read && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(item.reads[0].readAt).toLocaleDateString("ro-RO")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex">
        <Link href="/mentor/players" className="btn-secondary text-sm">
          ← Înapoi la jucători
        </Link>
      </div>
    </div>
  );
}
