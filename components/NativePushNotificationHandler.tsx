"use client";

import { useEffect } from "react";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export function NativePushNotificationHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let active = true;
    let listener: PluginListenerHandle | null = null;

    void PushNotifications.addListener("pushNotificationActionPerformed", (event) => {
      const url = event.notification.data?.url;
      if (typeof url !== "string" || !url) return;

      try {
        const destination = new URL(url, window.location.origin);
        if (destination.origin !== window.location.origin) return;
        window.location.assign(`${destination.pathname}${destination.search}${destination.hash}`);
      } catch (error) {
        console.error("[push] invalid notification URL:", error);
      }
    })
      .then((handle) => {
        if (active) {
          listener = handle;
        } else {
          void handle.remove().catch((error: unknown) => {
            console.error("[push] failed to remove notification listener:", error);
          });
        }
      })
      .catch((error: unknown) => {
        console.error("[push] failed to register notification listener:", error);
      });

    return () => {
      active = false;
      if (listener) {
        void listener.remove().catch((error: unknown) => {
          console.error("[push] failed to remove notification listener:", error);
        });
      }
    };
  }, []);

  return null;
}
