"use client";

import { useState, useEffect } from "react";
import { setConfidenceLevel } from "@/actions/player";
import type { Confidence } from "@/app/generated/prisma/client";

type Option = {
  value: Confidence;
  label: string;
  symbol: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
};

const OPTIONS: Option[] = [
  {
    value: "GOOD",
    label: "Bine",
    symbol: "✓",
    activeBg: "rgba(34,197,94,0.13)",
    activeBorder: "rgba(34,197,94,0.45)",
    activeText: "#22c55e",
  },
  {
    value: "OK",
    label: "OK",
    symbol: "—",
    activeBg: "rgba(245,158,11,0.13)",
    activeBorder: "rgba(245,158,11,0.45)",
    activeText: "#f59e0b",
  },
  {
    value: "HARD",
    label: "Greu",
    symbol: "✕",
    activeBg: "rgba(239,68,68,0.13)",
    activeBorder: "rgba(239,68,68,0.40)",
    activeText: "#ef4444",
  },
];

export function ConfidencePicker({ current }: { current: Confidence | null }) {
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
        <p className="kit-info-banner text-xs">
          Nivelul de încredere salvat local. Va fi sincronizat automat.
        </p>
      )}
      <div className="flex gap-2.5">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-all"
              style={{
                background: isActive ? opt.activeBg : "var(--kit-surface-2)",
                border: `1px solid ${isActive ? opt.activeBorder : "var(--kit-border)"}`,
              }}
            >
              <span
                className="text-2xl font-display font-bold leading-none"
                style={{ color: isActive ? opt.activeText : "var(--kit-text-3)" }}
              >
                {opt.symbol}
              </span>
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: isActive ? opt.activeText : "var(--kit-text-3)" }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

