import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getISOWeek, getWeekLabel, getStreak, startOfDayUTC } from "@/lib/streak";
import { RichTextViewer } from "@/components/RichTextViewer";
import { ConfidencePicker } from "./ConfidencePicker";
import Link from "next/link";
import { CheckCircle2, Circle, Flame, ArrowRight } from "lucide-react";

export default async function PlayerDashboard() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const today = startOfDayUTC(new Date());
  const { weekNumber, year } = getISOWeek(new Date());
  const weekLabel = getWeekLabel(new Date());

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

  const todayStr = today.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-xl space-y-4">

      {/* Today's date */}
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--kit-text-3)" }}>
        {todayStr}
      </p>

      {/* ── Mentor message ───────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{
          background: "var(--kit-surface)",
          border: "1px solid var(--kit-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--kit-accent)" }}
          />
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--kit-accent-light)" }}
          >
            {isTodayMessage ? "Mesajul de azi" : "Ultimul mesaj"}
          </p>
          {!isTodayMessage && messageToShow && (
            <span className="text-xs ml-auto" style={{ color: "var(--kit-text-3)" }}>
              {new Date(messageToShow.day).toLocaleDateString("ro-RO", {
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
          )}
        </div>
        {messageToShow ? (
          <RichTextViewer html={messageToShow.message} className="text-sm" />
        ) : (
          <p className="text-sm" style={{ color: "var(--kit-text-2)" }}>
            Mentorul tău nu a publicat încă un mesaj.
          </p>
        )}
      </div>

      {/* ── Daily metrics ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak */}
        <div
          className="rounded-2xl p-4 flex flex-col items-center justify-center gap-1"
          style={{
            background: streak > 0 ? "var(--kit-accent-dim)" : "var(--kit-surface)",
            border: `1px solid ${streak > 0 ? "var(--kit-accent)" : "var(--kit-border)"}`,
          }}
        >
          <Flame
            size={20}
            strokeWidth={2}
            style={{ color: streak > 0 ? "var(--kit-accent-light)" : "var(--kit-text-3)" }}
          />
          <p
            className="text-2xl font-display font-bold leading-none"
            style={{ color: streak > 0 ? "var(--kit-accent-light)" : "var(--kit-text)" }}
          >
            {streak}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-center leading-tight" style={{ color: "var(--kit-text-3)" }}>
            zile serie
          </p>
        </div>

        {/* Checkin */}
        <Link
          href="/player/checkin"
          className="rounded-2xl p-4 flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-80"
          style={{
            background: hasCheckin ? "var(--kit-success-dim)" : "var(--kit-surface)",
            border: `1px solid ${hasCheckin ? "rgba(34,197,94,0.30)" : "var(--kit-border)"}`,
          }}
        >
          {hasCheckin ? (
            <CheckCircle2 size={20} strokeWidth={2} style={{ color: "var(--kit-success)" }} />
          ) : (
            <Circle size={20} strokeWidth={1.5} style={{ color: "var(--kit-text-3)" }} />
          )}
          <p
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: hasCheckin ? "var(--kit-success)" : "var(--kit-text-3)" }}
          >
            Checkin
          </p>
          {!hasCheckin && (
            <p className="text-[9px] uppercase tracking-wide" style={{ color: "var(--kit-text-3)" }}>
              Completează
            </p>
          )}
        </Link>

        {/* Journal */}
        <Link
          href="/player/journal"
          className="rounded-2xl p-4 flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-80"
          style={{
            background: hasJournal ? "var(--kit-success-dim)" : "var(--kit-surface)",
            border: `1px solid ${hasJournal ? "rgba(34,197,94,0.30)" : "var(--kit-border)"}`,
          }}
        >
          {hasJournal ? (
            <CheckCircle2 size={20} strokeWidth={2} style={{ color: "var(--kit-success)" }} />
          ) : (
            <Circle size={20} strokeWidth={1.5} style={{ color: "var(--kit-text-3)" }} />
          )}
          <p
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: hasJournal ? "var(--kit-success)" : "var(--kit-text-3)" }}
          >
            Jurnal
          </p>
          {!hasJournal && (
            <p className="text-[9px] uppercase tracking-wide" style={{ color: "var(--kit-text-3)" }}>
              Scrie azi
            </p>
          )}
        </Link>
      </div>

      {/* ── Confidence picker ────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--kit-text-2)" }}>
          Cum mă simt azi?
        </p>
        <ConfidencePicker current={todayConfidence?.level ?? null} />
      </div>

      {/* ── Weekly scope ─────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--kit-text-2)" }}>
              Obiectiv săptămânal
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--kit-text-3)" }}>
              {weekLabel}
            </p>
          </div>
          {currentScope?.accomplished !== null && currentScope?.accomplished !== undefined && (
            <span
              className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{
                background: currentScope.accomplished ? "var(--kit-success-dim)" : "var(--kit-danger-dim)",
                color: currentScope.accomplished ? "var(--kit-success)" : "var(--kit-danger)",
              }}
            >
              {currentScope.accomplished ? "Realizat" : "Nerealizat"}
            </span>
          )}
        </div>

        {currentScope?.scope ? (
          <RichTextViewer html={currentScope.scope} className="text-sm" />
        ) : (
          <p className="text-sm" style={{ color: "var(--kit-text-2)" }}>
            Nu ai setat încă un obiectiv pentru săptămâna aceasta.
          </p>
        )}

        <Link
          href="/player/scope"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-opacity hover:opacity-70"
          style={{ color: "var(--kit-accent-light)" }}
        >
          Editează obiectivul <ArrowRight size={12} />
        </Link>
      </div>

      {/* ── Quick actions (only incomplete) ─────────────────── */}
      {(!hasCheckin || !hasJournal) && (
        <div className="grid grid-cols-2 gap-3">
          {!hasCheckin && (
            <Link
              href="/player/checkin"
              className="btn-primary text-center py-4 rounded-2xl text-sm font-bold uppercase tracking-wide"
            >
              Completează checkin
            </Link>
          )}
          {!hasJournal && (
            <Link
              href="/player/journal"
              className="rounded-2xl p-4 text-center text-sm font-bold uppercase tracking-wide transition-colors"
              style={{
                background: "var(--kit-surface-2)",
                border: "1px solid var(--kit-border)",
                color: "var(--kit-text)",
              }}
            >
              Scrie în jurnal
            </Link>
          )}
        </div>
      )}
    </div>
  );
}


