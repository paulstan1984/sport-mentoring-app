import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";
import type { Confidence } from "@/app/generated/prisma/client";

const VALID_LEVELS = new Set<string>(["GOOD", "OK", "HARD"]);

interface RequestBody {
  level: Confidence;
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

  const { level, day } = body;
  if (!level || !VALID_LEVELS.has(level) || !day) {
    return NextResponse.json({ error: "Date lipsă sau invalide." }, { status: 400 });
  }

  const dayDate = startOfDayUTC(new Date(day));

  await db.confidenceLevel.upsert({
    where: { playerId_day: { playerId, day: dayDate } },
    update: { level },
    create: { playerId, day: dayDate, level },
  });

  return NextResponse.json({ success: true });
}
