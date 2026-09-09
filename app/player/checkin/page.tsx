import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";
import { CheckinForm } from "./CheckinForm";
import { CheckinDayPicker } from "./CheckinDayPicker";
import { CheckinHistory } from "./CheckinHistory";
import { CheckinReportChart } from "./CheckinReportChart";

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
                where: {
                  deletedAt: null,
                  OR: [{ playerId: null }, { playerId }],
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  const items = player?.mentor?.checkinForm?.items ?? [];
  const mentorItems = items.filter((item) => item.playerId === null);
  const playerItems = items.filter((item) => item.playerId === playerId);

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

  const reportStart = new Date(today);
  reportStart.setUTCDate(reportStart.getUTCDate() - 13);
  const recentCheckedAnswers = items.length
    ? await db.checkinAnswer.findMany({
        where: {
          playerId,
          checked: true,
          flagId: { in: items.map((item) => item.id) },
          day: { gte: reportStart, lte: new Date(`${today.toISOString().slice(0, 10)}T23:59:59.999Z`) },
        },
      })
    : [];
  const checkinReportData = items.map((item) => ({
    label: item.label,
    checkedCount: recentCheckedAnswers.filter((answer) => answer.flagId === item.id).length,
  }));

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
          <CheckinForm
            mentorItems={mentorItems}
            playerItems={playerItems}
            answerMap={answerMap}
            selectedDay={selectedDay}
          />
          <CheckinReportChart data={checkinReportData} />
          <CheckinHistory days={recentAnswers.map((a) => a.day)} selectedDay={selectedDay} />
        </>
      )}
    </div>
  );
}
