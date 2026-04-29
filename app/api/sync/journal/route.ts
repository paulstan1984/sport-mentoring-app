import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";

interface RequestBody {
  whatDidGood: string | null;
  whatDidWrong: string | null;
  whatCanDoBetter: string | null;
  myScore: number;
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
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  const { whatDidGood, whatDidWrong, whatCanDoBetter, myScore, day } = body;
  if (!day) {
    return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
  }

  const dayDate = startOfDayUTC(new Date(day));
  const score = Math.min(5, Math.max(0, Number(myScore) || 0));

  await db.dailyJournal.upsert({
    where: { playerId_day: { playerId, day: dayDate } },
    update: {
      whatDidGood: whatDidGood || null,
      whatDidWrong: whatDidWrong || null,
      whatCanDoBetter: whatCanDoBetter || null,
      myScore: score,
    },
    create: {
      playerId,
      day: dayDate,
      whatDidGood: whatDidGood || null,
      whatDidWrong: whatDidWrong || null,
      whatCanDoBetter: whatCanDoBetter || null,
      myScore: score,
    },
  });

  return NextResponse.json({ success: true });
}
