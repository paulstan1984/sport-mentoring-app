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
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-display font-bold leading-tight mb-1" style={{ color: "var(--kit-text)" }}>
          Îmbunătățiri
        </h1>
        <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
          {today.toLocaleDateString("ro-RO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {ways.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--kit-text-2)" }}>
          Mentorul tău nu a definit încă modalități de îmbunătățire.
        </p>
      ) : (
        <ImprovementRatingForm ways={ways} ratingMap={ratingMap} />
      )}
    </div>
  );
}
