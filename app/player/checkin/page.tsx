import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";
import { CheckinForm } from "./CheckinForm";

export default async function CheckinPage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const today = startOfDayUTC(new Date());

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

  // Load today's existing answers
  const existingAnswers = await db.checkinAnswer.findMany({
    where: { playerId, day: today },
  });

  const answerMap = Object.fromEntries(
    existingAnswers.map((a) => [a.flagId, a])
  );

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Checkin zilnic</h1>
      <p className="text-sm text-gray-400 mb-6">
        {today.toLocaleDateString("ro-RO", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {items.length === 0 ? (
        <p className="text-gray-400">Mentorul tău nu a configurat încă formularul de checkin.</p>
      ) : (
        <CheckinForm items={items} answerMap={answerMap} />
      )}
    </div>
  );
}
