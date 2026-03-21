import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getISOWeek, getStreak, startOfDayUTC } from "@/lib/streak";
import { RichTextViewer } from "@/components/RichTextViewer";
import { ConfidencePicker } from "./ConfidencePicker";
import Link from "next/link";

const CONFIDENCE_LABEL: Record<string, string> = {
  GOOD: "😊 Bine",
  OK: "😐 OK",
  HARD: "😓 Greu",
};

export default async function PlayerDashboard() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const today = startOfDayUTC(new Date());
  const { weekNumber, year } = getISOWeek(new Date());

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: { mentor: true },
  });

  if (!player) return null;

  const [
    todayMessage,
    latestMessage,
    hasCheckin,
    hasJournal,
    todayConfidence,
    currentScope,
    streak,
  ] = await Promise.all([
    db.dailyMessage.findUnique({
      where: { mentorId_day: { mentorId: player.mentorId, day: today } },
    }),
    db.dailyMessage.findFirst({
      where: { mentorId: player.mentorId },
      orderBy: { day: "desc" },
    }),
    db.checkinAnswer.findFirst({ where: { playerId, day: today } }),
    db.dailyJournal.findFirst({ where: { playerId, day: today } }),
    db.confidenceLevel.findFirst({ where: { playerId, day: today } }),
    db.weeklyScope.findUnique({
      where: { playerId_weekNumber_year: { playerId, weekNumber, year } },
    }),
    getStreak(playerId),
  ]);

  const messageToShow = todayMessage ?? latestMessage;
  const isTodayMessage =
    !!messageToShow &&
    startOfDayUTC(new Date(messageToShow.day)).getTime() === today.getTime();

  return (
    <div className="max-w-xl space-y-6">
      {/* Mentor message */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
        <p className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-2">
          Mesajul mentorului tău
        </p>
        {messageToShow ? (
          <>
            <p className="text-xs text-blue-500/80 mb-3">
              {isTodayMessage
                ? "Astăzi"
                : `Ultimul mesaj: ${new Date(messageToShow.day).toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}`}
            </p>
            <RichTextViewer html={messageToShow.message} />
          </>
        ) : (
          <p className="text-sm text-blue-700 dark:text-blue-200">
            Mentorul tău nu a publicat încă un mesaj.
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{streak}</p>
          <p className="text-xs text-gray-400 mt-1">zile consecutiv</p>
        </div>
        <div className={`rounded-2xl shadow p-4 text-center ${hasCheckin ? "bg-green-50 dark:bg-green-950" : "bg-white dark:bg-gray-900"}`}>
          <p className="text-2xl">{hasCheckin ? "✅" : "⏳"}</p>
          <p className="text-xs text-gray-400 mt-1">Checkin</p>
        </div>
        <div className={`rounded-2xl shadow p-4 text-center ${hasJournal ? "bg-green-50 dark:bg-green-950" : "bg-white dark:bg-gray-900"}`}>
          <p className="text-2xl">{hasJournal ? "✅" : "⏳"}</p>
          <p className="text-xs text-gray-400 mt-1">Jurnal</p>
        </div>
      </div>

      {/* Confidence picker */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <p className="text-sm font-semibold mb-3">Cum mă simt azi?</p>
        <ConfidencePicker current={todayConfidence?.level ?? null} />
      </div>

      {/* Global scope */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 space-y-3">
        <p className="text-sm font-semibold">Obiectivul meu general</p>
        {player.objective ? (
          <RichTextViewer html={player.objective} className="text-sm" />
        ) : (
          <p className="text-sm text-gray-500">Nu ai setat încă obiectivul general.</p>
        )}
        <Link
          href="/player/profile"
          className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Editează obiectivul general
        </Link>
      </div>

      {/* Weekly scope */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Obiectiv săptămânal</p>
            <p className="text-xs text-gray-400">Săptămâna {weekNumber}, {year}</p>
          </div>
          {currentScope && currentScope.accomplished !== null && (
            <span className={`text-xs font-medium ${
              currentScope.accomplished
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}>
              {currentScope.accomplished ? "Realizat" : "Nerealizat"}
            </span>
          )}
        </div>

        {currentScope?.scope ? (
          <RichTextViewer html={currentScope.scope} className="text-sm" />
        ) : (
          <p className="text-sm text-gray-500">Nu ai setat încă un obiectiv pentru săptămâna aceasta.</p>
        )}

        <Link
          href="/player/scope"
          className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Editează obiectivul
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {!hasCheckin && (
          <Link href="/player/checkin" className="bg-blue-600 text-white rounded-2xl p-4 text-sm font-medium hover:bg-blue-700 transition-colors text-center">
            ✅ Completează checkin-ul
          </Link>
        )}
        {!hasJournal && (
          <Link href="/player/journal" className="bg-orange-500 text-white rounded-2xl p-4 text-sm font-medium hover:bg-orange-600 transition-colors text-center">
            📓 Scrie în jurnal
          </Link>
        )}
        <Link href="/player/scope" className="bg-white dark:bg-gray-900 shadow rounded-2xl p-4 text-sm font-medium hover:shadow-md transition-shadow text-center">
          🎯 Obiectiv săptămânal
        </Link>
        <Link href="/player/library" className="bg-white dark:bg-gray-900 shadow rounded-2xl p-4 text-sm font-medium hover:shadow-md transition-shadow text-center">
          📚 Bibliotecă
        </Link>
      </div>
    </div>
  );
}
