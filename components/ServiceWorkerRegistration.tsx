"use client";

import { useEffect } from "react";

/**
 * Registers the Service Worker and wires up background-sync messaging.
 * Render this once in the root layout (outside the SW-protected area).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Ask the SW to register a background-sync tag when it becomes active
        if (registration.active) {
          registration.active.postMessage({ type: "REGISTER_SYNC" });
        }

        // Listen for messages from the SW (e.g., sync trigger from background sync)
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "SYNC_QUEUED_ITEMS") {
            window.dispatchEvent(new CustomEvent("offline-sync"));
          }
        });
      })
      .catch(() => {
        // SW registration failure is non-fatal; the app works without it
      });
  }, []);

  return null;
}
