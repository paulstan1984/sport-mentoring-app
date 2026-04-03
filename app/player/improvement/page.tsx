import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";
import { ImprovementRatingForm } from "./ImprovementRatingForm";

export default async function ImprovementPage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const today = startOfDayUTC(new Date());

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      mentor: {
        include: {
          improvementWays: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  const ways = player?.mentor?.improvementWays ?? [];

  const existingRatings = await db.improvementWayRating.findMany({
    where: { playerId, day: today },
  });

  const ratingMap = Object.fromEntries(existingRatings.map((r) => [r.improvementWayId, r]));

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Modalități de îmbunătățire</h1>
      <p className="text-sm text-gray-400 mb-6">
        {today.toLocaleDateString("ro-RO", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {ways.length === 0 ? (
        <p className="text-gray-400">
          Mentorul tău nu a definit încă modalități de îmbunătățire.
        </p>
      ) : (
        <ImprovementRatingForm ways={ways} ratingMap={ratingMap} />
      )}
    </div>
  );
}
