"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

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

type Status = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed";

export function PushSubscriptionButton() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
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
      registration.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? "subscribed" : "unsubscribed");
      });
    });
  }, []);

  async function subscribe() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

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
        <span>Notificările sunt blocate în browser. Activează-le din setările browserului.</span>
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
