"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BellOff } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const SERVICE_WORKER_TIMEOUT_MS = 8_000;
const PUSH_OPERATION_TIMEOUT_MS = 15_000;
const API_REQUEST_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error("timeout")), ms);

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function saveSubscription(endpoint: string, keys: { p256dh: string; auth: string }): Promise<void> {
  const response = await fetchWithTimeout("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, keys }),
  });

  if (!response.ok) {
    throw new Error("subscription-save-failed");
  }
}

async function removeSubscription(endpoint: string): Promise<void> {
  const response = await fetchWithTimeout("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });

  if (!response.ok) {
    throw new Error("subscription-remove-failed");
  }
}

function getPushErrorMessage(error: unknown, action: "activa" | "dezactiva"): string {
  if (
    (error instanceof Error && error.message === "timeout") ||
    (error instanceof DOMException && error.name === "AbortError")
  ) {
    return "Solicitarea a expirat. Verifică conexiunea și încearcă din nou.";
  }

  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Permisiunea pentru notificări nu a fost acordată.";
  }

  return `Nu am putut ${action} notificările push. Încearcă din nou.`;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Detect if running inside a Capacitor native shell */
function isCapacitorNative(): boolean {
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

type Status = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed";
type NativeListener = { remove: () => Promise<void> };
type NativePushToken = { value: string };
type NativePushRegistrationError = { error?: string };
type NativePushPermission = { receive: string };

export function PushSubscriptionButton() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [native, setNative] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (isCapacitorNative()) {
      setNative(true);
      // For native apps, check if we already stored a token
      checkNativeSubscription();
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      setStatus("unsupported");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    const permission = Notification.permission;
    if (permission === "denied") {
      setStatus("denied");
      return;
    }

    let active = true;

    void (async () => {
      try {
        const registration = await withTimeout(
          navigator.serviceWorker.ready,
          SERVICE_WORKER_TIMEOUT_MS
        );
        const sub = await withTimeout(
          registration.pushManager.getSubscription(),
          SERVICE_WORKER_TIMEOUT_MS
        );

        if (active) {
          swRegistrationRef.current = registration;
          setStatus(sub ? "subscribed" : "unsubscribed");
        }
      } catch (err) {
        console.error("[push] service worker initialization error:", err);
        if (active) {
          setStatus("unsubscribed");
          setError("Serviciul de notificări nu este pregătit. Reîncarcă pagina și încearcă din nou.");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function checkNativeSubscription() {
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const permResult = await PushNotifications.checkPermissions();
      if (permResult.receive === "denied") {
        setStatus("denied");
      } else if (permResult.receive === "granted") {
        // If permission granted, assume subscribed (token was registered)
        setStatus("subscribed");
      } else {
        setStatus("unsubscribed");
      }
    } catch {
      setStatus("unsubscribed");
    }
  }

  async function subscribeNative() {
    setBusy(true);
    setError(null);
    let registrationListener: NativeListener | null = null;
    let registrationErrorListener: NativeListener | null = null;

    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      const permResult = (await withTimeout(
        PushNotifications.requestPermissions(),
        SERVICE_WORKER_TIMEOUT_MS
      )) as NativePushPermission;
      if (permResult.receive !== "granted") {
        setStatus("denied");
        return;
      }

      let resolveToken: (token: string) => void = () => undefined;
      let rejectToken: (reason?: unknown) => void = () => undefined;
      const tokenPromise = new Promise<string>((resolve, reject) => {
        resolveToken = resolve;
        rejectToken = reject;
      });

      registrationListener = await withTimeout(
        PushNotifications.addListener("registration", (token: NativePushToken) => {
          resolveToken(token.value);
        }),
        SERVICE_WORKER_TIMEOUT_MS
      );
      registrationErrorListener = await withTimeout(
        PushNotifications.addListener("registrationError", (event: NativePushRegistrationError) => {
          rejectToken(new Error(event.error ?? "native-registration-failed"));
        }),
        SERVICE_WORKER_TIMEOUT_MS
      );

      await withTimeout(PushNotifications.register(), PUSH_OPERATION_TIMEOUT_MS);
      const token = await withTimeout(tokenPromise, PUSH_OPERATION_TIMEOUT_MS);
      await saveSubscription(`fcm://${token}`, { p256dh: "native", auth: "native" });
      setStatus("subscribed");
    } catch (err) {
      console.error("[push] native subscribe error:", err);
      setError(getPushErrorMessage(err, "activa"));
    } finally {
      if (registrationListener) {
        void registrationListener.remove().catch(() => undefined);
      }
      if (registrationErrorListener) {
        void registrationErrorListener.remove().catch(() => undefined);
      }
      setBusy(false);
    }
  }

  async function unsubscribeNative() {
    setBusy(true);
    setError(null);
    try {
      await removeSubscription("fcm://unregister");
      setStatus("unsubscribed");
    } catch (err) {
      console.error("[push] native unsubscribe error:", err);
      setError(getPushErrorMessage(err, "dezactiva"));
    } finally {
      setBusy(false);
    }
  }

  async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
    if (swRegistrationRef.current) {
      return swRegistrationRef.current;
    }

    const registration = await withTimeout(
      navigator.serviceWorker.ready,
      SERVICE_WORKER_TIMEOUT_MS
    );
    swRegistrationRef.current = registration;
    return registration;
  }

  async function subscribe() {
    if (native) {
      return subscribeNative();
    }
    setBusy(true);
    setError(null);
    try {
      const permission = await withTimeout(
        Notification.requestPermission(),
        SERVICE_WORKER_TIMEOUT_MS
      );
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const registration = await getServiceWorkerRegistration();

      const sub = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }),
        PUSH_OPERATION_TIMEOUT_MS
      );

      const subscription = sub.toJSON();
      if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys.auth) {
        throw new Error("invalid-subscription");
      }

      await saveSubscription(subscription.endpoint, {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });

      setStatus("subscribed");
    } catch (err) {
      console.error("[push] subscribe error:", err);
      setError(getPushErrorMessage(err, "activa"));
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    if (native) {
      return unsubscribeNative();
    }
    setBusy(true);
    setError(null);
    try {
      const registration = await getServiceWorkerRegistration();
      const sub = await withTimeout(
        registration.pushManager.getSubscription(),
        SERVICE_WORKER_TIMEOUT_MS
      );
      if (sub) {
        const endpoint = sub.endpoint;
        await withTimeout(sub.unsubscribe(), PUSH_OPERATION_TIMEOUT_MS);
        await removeSubscription(endpoint);
      }
      setStatus("unsubscribed");
    } catch (err) {
      console.error("[push] unsubscribe error:", err);
      setError(getPushErrorMessage(err, "dezactiva"));
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;
  if (status === "unsupported") return null;

  if (status === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <BellOff size={16} />
        <span>Notificările sunt blocate. Activează-le din setările {native ? "telefonului" : "browserului"}.</span>
      </div>
    );
  }

  if (status === "subscribed") {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={unsubscribe}
          disabled={busy}
          aria-busy={busy}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <BellOff size={16} />
          {busy ? "Se procesează..." : "Dezactivează notificările push"}
        </button>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={subscribe}
        disabled={busy}
        aria-busy={busy}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <Bell size={16} />
        {busy ? "Se procesează..." : "Activează notificările push"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
