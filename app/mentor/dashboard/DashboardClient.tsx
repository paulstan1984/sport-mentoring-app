"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PresenceBadge } from "@/components/PresenceBadge";

type PlayerSummary = {
  id: number;
  name: string;
  username: string;
  team: string | null;
  position: string | null;
  photo: string | null;
  lastActiveAt: string | null;
  checkedInToday: boolean;
  confidenceToday: "GOOD" | "OK" | "HARD" | null;
};

const CONFIDENCE_LABEL: Record<string, string> = {
  GOOD: "😊 Bine",
  OK: "😐 OK",
  HARD: "😓 Greu",
};

export function DashboardClient({ players, playerLabel }: { players: PlayerSummary[]; playerLabel: string }) {
  const router = useRouter();

  // Poll every 60 seconds to refresh presence data (skip when offline)
  useEffect(() => {
    const id = setInterval(() => {
      if (navigator.onLine) router.refresh();
    }, 60_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.length === 0 && (
          <p className="text-gray-400 col-span-full">
            Nu ai {playerLabel.toLowerCase()}i adăugați.{" "}
            <Link href="/mentor/players" className="text-blue-500 underline">
              Adaugă un {playerLabel.toLowerCase()}
            </Link>
            .
          </p>
        )}
        {players.map((p) => (
          <Link
            key={p.id}
            href={`/mentor/players/${p.id}`}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 hover:shadow-md transition-shadow flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.team ?? "—"}</p>
                </div>
              </div>
              <PresenceBadge lastActiveAt={p.lastActiveAt ? new Date(p.lastActiveAt) : null} />
            </div>

            <div className="flex flex-wrap gap-2 text-xs mt-1">
              {p.position && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {p.position}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full ${
                  p.checkedInToday
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}
              >
                {p.checkedInToday ? "✅ Checkin ok" : "⏳ Fără checkin"}
              </span>
              {p.confidenceToday && (
                <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                  {CONFIDENCE_LABEL[p.confidenceToday]}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
