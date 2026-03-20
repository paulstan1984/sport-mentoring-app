"use client";

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
  async function pick(level: Confidence) {
    await setConfidenceLevel(level);
  }

  return (
    <div className="flex gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => pick(opt.value)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
            current === opt.value
              ? `${opt.color} border-current`
              : "bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400"
          }`}
        >
          <span className="text-2xl">{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
