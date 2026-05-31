import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushNotification } from "@/lib/webpush";

interface SendBody {
  title: string;
  body: string;
  url?: string;
  /** If set, only send to this specific player's subscriptions */
  playerId?: number;
}

/**
 * POST /api/push/send
 * Mentor-only endpoint. Sends a push notification to all players of the
 * current mentor (or a specific player if `playerId` is supplied).
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "MENTOR" || !session.mentorId) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  let body: SendBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date nevalide." }, { status: 400 });
  }

  const { title, body: msgBody, url, playerId } = body;
  if (!title || !msgBody) {
    return NextResponse.json({ error: "Titlul și mesajul sunt obligatorii." }, { status: 400 });
  }

  // Fetch mentor theme to pick the right notification icon
  const mentor = await db.mentor.findUnique({
    where: { id: session.mentorId },
    select: { theme: true },
  });
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const icon =
    mentor?.theme === "MIND_MENTOR"
      ? `${base}/icon-mind.png`
      : `${base}/icon-sport.png`;

  // Collect user IDs of the mentor's active players
  const playerFilter = playerId
    ? { id: playerId, mentorId: session.mentorId, isActive: true }
    : { mentorId: session.mentorId, isActive: true };

  const players = await db.player.findMany({
    where: playerFilter,
    select: { userId: true },
  });

  if (players.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const userIds = players.map((p) => p.userId);

  // Fetch push subscriptions for those users
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const payload = { title, body: msgBody, url: url ?? "/player/checkin", icon };
  const expiredEndpoints: string[] = [];
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        const ok = await sendPushNotification(
          sub.endpoint,
          { p256dh: sub.p256dh, auth: sub.auth },
          payload
        );
        if (ok) sent++;
      } catch {
        expiredEndpoints.push(sub.endpoint);
      }
    })
  );

  // Clean up expired subscriptions
  if (expiredEndpoints.length > 0) {
    await db.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    });
  }

  return NextResponse.json({ sent });
}
