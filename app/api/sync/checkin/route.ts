import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";

interface CheckinAnswer {
  flagId: number;
  checked: boolean;
  stringValue: string | null;
}

interface RequestBody {
  answers: CheckinAnswer[];
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

  const { answers, day } = body;
  if (!Array.isArray(answers) || !day) {
    return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
  }

  const dayDate = startOfDayUTC(new Date(day));

  // Verify the flagIds belong to this player's mentor's form
  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      mentor: {
        include: {
          checkinForm: {
            include: { items: { where: { deletedAt: null } } },
          },
        },
      },
    },
  });

  if (!player?.mentor.checkinForm) {
    return NextResponse.json(
      { error: "Formularul nu este disponibil." },
      { status: 400 }
    );
  }

  const validIds = new Set(player.mentor.checkinForm.items.map((i) => i.id));
  const validAnswers = answers.filter((a) => validIds.has(a.flagId));

  await db.$transaction(
    validAnswers.map((a) =>
      db.checkinAnswer.upsert({
        where: { playerId_flagId_day: { playerId, flagId: a.flagId, day: dayDate } },
        update: { checked: a.checked, stringValue: a.stringValue },
        create: {
          playerId,
          flagId: a.flagId,
          day: dayDate,
          checked: a.checked,
          stringValue: a.stringValue,
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
