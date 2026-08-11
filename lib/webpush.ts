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

/** Check if an endpoint is an FCM native token (stored as fcm://TOKEN) */
export function isFcmEndpoint(endpoint: string): boolean {
  return endpoint.startsWith("fcm://");
}

/** Extract the FCM token from an fcm:// endpoint */
function extractFcmToken(endpoint: string): string {
  return endpoint.slice("fcm://".length);
}

/**
 * Send a push notification via Firebase Cloud Messaging (legacy HTTP API).
 * Requires FCM_SERVER_KEY environment variable.
 */
async function sendFcmNotification(
  token: string,
  payload: PushPayload
): Promise<boolean> {
  const serverKey = process.env.FCM_SERVER_KEY;
  if (!serverKey) {
    console.warn("[fcm] FCM_SERVER_KEY not configured — skipping native push.");
    return false;
  }

  const response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${serverKey}`,
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        click_action: payload.url,
      },
      data: {
        url: payload.url,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 404 || response.status === 410) {
      throw new Error(`FCM token expired: ${text}`);
    }
    console.error("[fcm] send error:", response.status, text);
    return false;
  }

  const result = await response.json();
  if (result.failure > 0) {
    const error = result.results?.[0]?.error;
    if (error === "NotRegistered" || error === "InvalidRegistration") {
      throw new Error(`FCM token invalid: ${error}`);
    }
    console.error("[fcm] send failure:", result);
    return false;
  }

  return true;
}

export async function sendPushNotification(
  endpoint: string,
  keys: SubscriptionKeys,
  payload: PushPayload
): Promise<boolean> {
  // Handle native FCM tokens
  if (isFcmEndpoint(endpoint)) {
    const token = extractFcmToken(endpoint);
    return sendFcmNotification(token, payload);
  }

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
