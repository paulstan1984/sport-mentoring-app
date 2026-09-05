import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";
import { CheckinForm } from "./CheckinForm";
import { CheckinDayPicker } from "./CheckinDayPicker";
import { CheckinHistory } from "./CheckinHistory";

interface CheckinPageProps {
  searchParams?: Promise<{ day?: string }>;
}

export default async function CheckinPage({ searchParams }: CheckinPageProps) {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const params = await searchParams;
  const today = startOfDayUTC(new Date());
  const selectedDay = params?.day
    ? startOfDayUTC(new Date(params.day))
    : today;

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      mentor: {
        include: {
          checkinForm: {
            include: {
              items: {
                where: { deletedAt: null },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  const items = player?.mentor?.checkinForm?.items ?? [];

  // Load existing answers for the selected day
  const existingAnswers = await db.checkinAnswer.findMany({
    where: { playerId, day: selectedDay },
  });

  const answerMap = Object.fromEntries(
    existingAnswers.map((a) => [a.flagId, a])
  );

  // Recent days with at least one answer for history
  const recentAnswers = await db.checkinAnswer.findMany({
    where: { playerId },
    select: { day: true },
    distinct: ["day"],
    orderBy: { day: "desc" },
    take: 30,
  });

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-display font-bold leading-tight mb-1" style={{ color: "var(--kit-text)" }}>
          Checkin zilnic
        </h1>
        <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
          {selectedDay.toLocaleDateString("ro-RO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--kit-text-2)" }}>
          Mentorul tău nu a configurat încă formularul de checkin.
        </p>
      ) : (
        <>
          <CheckinDayPicker selectedDay={selectedDay} />
          <CheckinForm items={items} answerMap={answerMap} selectedDay={selectedDay} />
          <CheckinHistory days={recentAnswers.map((a) => a.day)} selectedDay={selectedDay} />
        </>
      )}
    </div>
  );
}
