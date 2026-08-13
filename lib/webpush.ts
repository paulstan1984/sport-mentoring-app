import webpush from "web-push";
import { createSign } from "crypto";

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

/** Cached OAuth2 access token to avoid re-fetching on every notification. */
let cachedFcmToken: { token: string; expiresAt: number } | null = null;

/** Obtain a short-lived OAuth2 access token via a service-account JWT (RFC 7523). */
async function getFcmAccessToken(): Promise<string | null> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    console.warn("[fcm] FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not configured.");
    return null;
  }

  if (cachedFcmToken && cachedFcmToken.expiresAt > Date.now() + 60_000) {
    return cachedFcmToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(jwtPayload)).toString("base64url");
  const unsigned = `${header}.${body}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer.sign(privateKey, "base64url");
  const jwt = `${unsigned}.${signature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    console.error("[fcm] Failed to get access token:", await tokenResponse.text());
    return null;
  }

  const data = (await tokenResponse.json()) as { access_token: string; expires_in: number };
  cachedFcmToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedFcmToken.token;
}

/**
 * Send a push notification via Firebase Cloud Messaging HTTP v1 API.
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.
 */
async function sendFcmNotification(
  token: string,
  payload: PushPayload
): Promise<boolean> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn("[fcm] FIREBASE_PROJECT_ID not configured — skipping native push.");
    return false;
  }

  const accessToken = await getFcmAccessToken();
  if (!accessToken) return false;

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: {
            url: payload.url ?? "",
            icon: payload.icon ?? "",
          },
          android: {
            notification: {
              icon: payload.icon,
              click_action: payload.url,
            },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 404 || response.status === 410) {
      throw new Error(`FCM token expired: ${text}`);
    }
    console.error("[fcm] send error:", response.status, text);
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
