"use client";

import { useActionState, useState, useEffect } from "react";
import { saveImprovementWayRatings } from "@/actions/player";
import { RichTextViewer } from "@/components/RichTextViewer";
import type { ImprovementWay, ImprovementWayRating } from "@/app/generated/prisma/client";

type RatingMap = Record<number, ImprovementWayRating>;

const SCORE_LABELS: Record<number, string> = {
  1: "1 – Deloc",
  2: "2 – Puțin",
  3: "3 – Parțial",
  4: "4 – Mult",
  5: "5 – Complet",
};

const DEFAULT_SCORE = 3;

export function ImprovementRatingForm({
  ways,
  ratingMap,
}: {
  ways: ImprovementWay[];
  ratingMap: RatingMap;
}) {
  const wrappedAction = async (
    prev: Awaited<ReturnType<typeof saveImprovementWayRatings>> | null,
    formData: FormData
  ) => {
    try {
      return await saveImprovementWayRatings(prev, formData);
    } catch {
      return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." };
    }
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);
  const [scores, setScores] = useState<Record<number, number>>(
    Object.fromEntries(ways.map((w) => [w.id, ratingMap[w.id]?.score ?? DEFAULT_SCORE]))
  );
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

  const alreadySubmitted = Object.values(ratingMap).length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (navigator.onLine) return; // let the form action proceed normally

    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    const ratings = ways.map((w) => ({
      wayId: w.id,
      score: Math.min(5, Math.max(1, scores[w.id] ?? DEFAULT_SCORE)),
    }));

    const { enqueue } = await import("@/lib/offline-db");
    await enqueue({
      type: "improvement",
      endpoint: "/api/sync/improvement",
      payload: { ratings, day: today },
      day: today,
    });

    setOfflineQueued(true);
    window.dispatchEvent(new CustomEvent("offline-enqueued"));
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-xl text-sm">
          ⚠️ Ești offline. Datele vor fi salvate local și sincronizate automat când te reconectezi.
        </div>
      )}

      {alreadySubmitted && isOnline && (
        <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm">
          ✅ Ai completat evaluarea de astăzi. Poți actualiza oricând.
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-100 dark:divide-gray-800">
        {ways.map((way) => (
          <div key={way.id} className="px-5 py-4 space-y-3">
            <input type="hidden" name={`score_${way.id}`} value={scores[way.id] ?? 3} />
            <p className="text-sm font-medium">{way.title}</p>
            {way.description && (
              <RichTextViewer html={way.description} className="text-xs text-gray-500" />
            )}
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setScores((prev) => ({ ...prev, [way.id]: val }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    scores[way.id] === val
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                  }`}
                >
                  {SCORE_LABELS[val]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-xl">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-xl">
          Evaluarea a fost salvată! ✅
        </p>
      )}
      {offlineQueued && !isOnline && (
        <p className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-xl">
          💾 Evaluarea a fost salvată local. Va fi sincronizată automat când te reconectezi.
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Se salvează..." : "Salvează evaluarea"}
      </button>
    </form>
  );
}
