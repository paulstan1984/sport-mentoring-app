"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BellOff } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
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

export function PushSubscriptionButton() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [native, setNative] = useState(false);
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

    navigator.serviceWorker.ready.then((registration) => {
      swRegistrationRef.current = registration;
      registration.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? "subscribed" : "unsubscribed");
      });
    });
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
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive !== "granted") {
        setStatus("denied");
        return;
      }

      await PushNotifications.register();

      // Listen for the registration token
      await new Promise<void>((resolve, reject) => {
        PushNotifications.addListener("registration", async (token) => {
          try {
            // Store the FCM token as a special endpoint on the server
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                endpoint: `fcm://${token.value}`,
                keys: { p256dh: "native", auth: "native" },
              }),
            });
            setStatus("subscribed");
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("[push] native registration error:", err);
          reject(err);
        });
      });
    } catch (err) {
      console.error("[push] native subscribe error:", err);
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribeNative() {
    setBusy(true);
    try {
      // We cannot easily get the token back, so just remove all fcm:// subscriptions for user
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "fcm://unregister" }),
      });
      setStatus("unsubscribed");
    } catch (err) {
      console.error("[push] native unsubscribe error:", err);
    } finally {
      setBusy(false);
    }
  }

  async function subscribe() {
    if (native) {
      return subscribeNative();
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      // Use cached registration — avoids navigator.serviceWorker.ready hanging
      // indefinitely when the SW is reinstalling (e.g. after a deploy).
      const registration =
        swRegistrationRef.current ??
        (await withTimeout(navigator.serviceWorker.ready, 8000));

      const sub = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }),
        15000
      );

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, keys }),
      });

      setStatus("subscribed");
    } catch (err) {
      console.error("[push] subscribe error:", err);
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    if (native) {
      return unsubscribeNative();
    }
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setStatus("unsubscribed");
    } catch (err) {
      console.error("[push] unsubscribe error:", err);
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
      <button
        onClick={unsubscribe}
        disabled={busy}
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <BellOff size={16} />
        {busy ? "Se procesează..." : "Dezactivează notificările push"}
      </button>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={busy}
      className="btn-primary flex items-center gap-2 text-sm"
    >
      <Bell size={16} />
      {busy ? "Se procesează..." : "Activează notificările push"}
    </button>
  );
}
