import webpush from "web-push";

let initialized = false;

function initVapid() {
  if (initialized) return;
  const subject = process.env.VAPID_EMAIL;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    return;
  }

  webpush.setVapidDetails(`mailto:${subject}`, publicKey, privateKey);
  initialized = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export interface SubscriptionKeys {
  p256dh: string;
  auth: string;
}

export async function sendPushNotification(
  endpoint: string,
  keys: SubscriptionKeys,
  payload: PushPayload
): Promise<boolean> {
  initVapid();

  if (!initialized) {
    console.warn("[webpush] VAPID keys not configured — skipping push.");
    return false;
  }

  try {
    await webpush.sendNotification(
      { endpoint, keys },
      JSON.stringify(payload),
      { TTL: 86400 }
    );
    return true;
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // Subscription is no longer valid — caller should remove it from DB
      throw err;
    }
    console.error("[webpush] sendNotification error:", err);
    return false;
  }
}

/** Generate a new VAPID key pair (run once, persist to env). */
export function generateVapidKeys() {
  return webpush.generateVAPIDKeys();
}
