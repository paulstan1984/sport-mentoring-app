import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";

interface Rating {
  wayId: number;
  score: number;
}

interface RequestBody {
  ratings: Rating[];
  day: string;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "PLAYER" || !session.playerId) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }
  const playerId = session.playerId;

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date nevalide." }, { status: 400 });
  }

  const { ratings, day } = body;
  if (!Array.isArray(ratings) || !day) {
    return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
  }

  const dayDate = startOfDayUTC(new Date(day));

  // Verify improvement ways belong to this player's mentor
  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      mentor: {
        include: {
          improvementWays: { where: { deletedAt: null } },
        },
      },
    },
  });

  if (!player) {
    return NextResponse.json({ error: "Jucător negăsit." }, { status: 400 });
  }

  const validWayIds = new Set(player.mentor.improvementWays.map((w) => w.id));
  const validRatings = ratings.filter((r) => validWayIds.has(r.wayId));

  await db.$transaction(
    validRatings.map((r) =>
      db.improvementWayRating.upsert({
        where: {
          playerId_improvementWayId_day: {
            playerId,
            improvementWayId: r.wayId,
            day: dayDate,
          },
        },
        update: { score: Math.min(5, Math.max(1, r.score)) },
        create: {
          playerId,
          improvementWayId: r.wayId,
          day: dayDate,
          score: Math.min(5, Math.max(1, r.score)),
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
