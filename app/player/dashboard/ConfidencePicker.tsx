"use client";

import { useState, useEffect } from "react";
import { setConfidenceLevel } from "@/actions/player";
import type { Confidence } from "@/app/generated/prisma/client";

const OPTIONS: { value: Confidence; label: string; emoji: string; color: string }[] = [
  { value: "GOOD", label: "Bine", emoji: "😊", color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
  { value: "OK", label: "OK", emoji: "😐", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700" },
  { value: "HARD", label: "Greu", emoji: "😓", color: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
];

export function ConfidencePicker({
  current,
}: {
  current: Confidence | null;
}) {
  const [selected, setSelected] = useState<Confidence | null>(current);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueued, setOfflineQueued] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function pick(level: Confidence) {
    setSelected(level);

    if (!isOnline) {
      const today = new Date().toISOString().split("T")[0];
      const { enqueue } = await import("@/lib/offline-db");
      await enqueue({
        type: "confidence",
        endpoint: "/api/sync/confidence",
        payload: { level, day: today },
        day: today,
      });
      setOfflineQueued(true);
      window.dispatchEvent(new CustomEvent("offline-enqueued"));
      return;
    }

    await setConfidenceLevel(level);
  }

  return (
    <div className="space-y-3">
      {offlineQueued && !isOnline && (
        <p className="text-xs text-blue-600 dark:text-blue-400">
          💾 Nivelul de încredere salvat local. Va fi sincronizat automat.
        </p>
      )}
      <div className="flex gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => pick(opt.value)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
              selected === opt.value
                ? `${opt.color} border-current`
                : "bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400"
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
