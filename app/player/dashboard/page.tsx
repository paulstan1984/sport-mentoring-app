import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStreak, startOfDayUTC } from "@/lib/streak";
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

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: { mentor: true },
  });

  if (!player) return null;

  const [
    todayMessage,
    hasCheckin,
    hasJournal,
    todayConfidence,
    streak,
  ] = await Promise.all([
    db.dailyMessage.findUnique({
      where: { mentorId_day: { mentorId: player.mentorId, day: today } },
    }),
    db.checkinAnswer.findFirst({ where: { playerId, day: today } }),
    db.dailyJournal.findFirst({ where: { playerId, day: today } }),
    db.confidenceLevel.findFirst({ where: { playerId, day: today } }),
    getStreak(playerId),
  ]);

  return (
    <div className="max-w-xl space-y-6">
      {/* Mentor message */}
      {todayMessage && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
          <p className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-2">
            Mesajul mentorului tău
          </p>
          <RichTextViewer html={todayMessage.message} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{streak}</p>
          <p className="text-xs text-gray-400 mt-1">zile consecutiv</p>
        </div>
        <div className={`rounded-2xl shadow p-4 text-center ${hasCheckin ? "bg-green-50 dark:bg-green-950" : "bg-white dark:bg-gray-900"}`}>
          <p className="text-2xl">{hasCheckin ? "✅" : "⏳"}</p>
          <p className="text-xs text-gray-400 mt-1">Pontaj</p>
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

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {!hasCheckin && (
          <Link href="/player/checkin" className="bg-blue-600 text-white rounded-2xl p-4 text-sm font-medium hover:bg-blue-700 transition-colors text-center">
            ✅ Completează pontajul
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
