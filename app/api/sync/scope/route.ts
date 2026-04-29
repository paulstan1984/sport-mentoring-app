import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

interface RequestBody {
  scope: string | null;
  weekNumber: number;
  year: number;
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

  const { scope, weekNumber, year } = body;
  if (weekNumber == null || year == null) {
    return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
  }

  await db.weeklyScope.upsert({
    where: { playerId_weekNumber_year: { playerId, weekNumber, year } },
    update: { scope: scope || null },
    create: { playerId, weekNumber, year, scope: scope || null },
  });

  return NextResponse.json({ success: true });
}
