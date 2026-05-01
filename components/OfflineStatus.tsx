"use client";

import { useState, useEffect, useCallback } from "react";
import type { OfflineEntry } from "@/lib/offline-db";

/**
 * Displays an offline / syncing status banner and drives the sync loop.
 *
 * - Offline  → amber banner with pending-item count
 * - Syncing  → blue banner
 * - After sync with 0 pending → renders nothing
 *
 * Place this inside the player or mentor layout (not the admin layout).
 */
export function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await import("@/lib/offline-db");
      setPendingCount(await count());
    } catch {
      // IndexedDB not available (SSR guard)
    }
  }, []);

  const syncPending = useCallback(async () => {
    let items: OfflineEntry[] = [];
    try {
      const { getAll } = await import("@/lib/offline-db");
      items = await getAll();
    } catch {
      return;
    }
    if (items.length === 0) return;

    setIsSyncing(true);
    const { remove } = await import("@/lib/offline-db");

    for (const item of items) {
      try {
        const res = await fetch(item.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.payload),
        });
        if (res.ok) {
          await remove(item.id);
          setJustSynced(true);
        }
      } catch {
        // Will retry on next online event
      }
    }

    setIsSyncing(false);
    await refreshCount();

    // Hide the "synced" confirmation after 3 s
    setTimeout(() => setJustSynced(false), 3000);
  }, [refreshCount]);

  useEffect(() => {
    // Initialise synchronously from browser state
    setIsOnline(navigator.onLine);
    refreshCount();

    const handleOnline = () => {
      setIsOnline(true);
      syncPending();
    };
    const handleOffline = () => setIsOnline(false);
    const handleSyncEvent = () => syncPending();
    // Triggered by form components when they enqueue an item
    const handleEnqueued = () => refreshCount();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    // Triggered by ServiceWorkerRegistration when the SW fires a background sync
    window.addEventListener("offline-sync", handleSyncEvent);
    window.addEventListener("offline-enqueued", handleEnqueued);

    // Sync any leftover items from a previous offline session
    if (navigator.onLine) syncPending();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline-sync", handleSyncEvent);
      window.removeEventListener("offline-enqueued", handleEnqueued);
    };
  }, [syncPending, refreshCount]);

  // Also re-count whenever the page regains focus (user switches tabs)
  useEffect(() => {
    const handleFocus = () => {
      if (navigator.onLine) refreshCount();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshCount]);

  if (isOnline && pendingCount === 0 && !isSyncing && !justSynced) return null;

  const bg = !isOnline
    ? "bg-amber-500"
    : isSyncing
    ? "bg-blue-500"
    : "bg-green-500";

  let label: string;
  if (!isOnline) {
    const pendingNote =
      pendingCount > 0
        ? ` · ${pendingCount} ${pendingCount === 1 ? "intrare în așteptare" : "intrări în așteptare"}`
        : "";
    label = `⚡ Ești offline${pendingNote}`;
  } else if (isSyncing) {
    label = "🔄 Se sincronizează datele offline...";
  } else {
    label = "✅ Date sincronizate cu serverul";
  }

  return (
    <div className={`${bg} text-white text-xs text-center px-4 py-1.5 font-medium`}>
      {label}
    </div>
  );
}
