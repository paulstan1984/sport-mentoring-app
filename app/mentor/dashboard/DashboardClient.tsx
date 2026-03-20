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
  lastActiveAt: string | null;
  checkedInToday: boolean;
  confidenceToday: "GOOD" | "OK" | "HARD" | null;
};

const CONFIDENCE_LABEL: Record<string, string> = {
  GOOD: "😊 Bine",
  OK: "😐 OK",
  HARD: "😓 Greu",
};

export function DashboardClient({ players }: { players: PlayerSummary[] }) {
  const router = useRouter();

  // Poll every 60 seconds to refresh presence data
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.length === 0 && (
          <p className="text-gray-400 col-span-full">
            Nu ai jucători adăugați.{" "}
            <Link href="/mentor/players" className="text-blue-500 underline">
              Adaugă un jucător
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
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">{p.team ?? "—"}</p>
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
                {p.checkedInToday ? "✅ Pontaj ok" : "⏳ Fără pontaj"}
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
