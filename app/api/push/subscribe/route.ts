import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

interface SubscribeBody {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/** POST /api/push/subscribe — save or update a push subscription for the current user. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date nevalide." }, { status: 400 });
  }

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
  }

  await db.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId: session.userId },
    create: {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userId: session.userId,
    },
  });

  return NextResponse.json({ success: true });
}

/** DELETE /api/push/subscribe — remove a push subscription for the current user. */
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  let body: { endpoint: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date nevalide." }, { status: 400 });
  }

  const { endpoint } = body;
  if (!endpoint) {
    return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
  }

  // Special case: remove all native FCM subscriptions for this user
  if (endpoint === "fcm://unregister") {
    await db.pushSubscription.deleteMany({
      where: { userId: session.userId, endpoint: { startsWith: "fcm://" } },
    });
  } else {
    await db.pushSubscription.deleteMany({
      where: { endpoint, userId: session.userId },
    });
  }

  return NextResponse.json({ success: true });
}
