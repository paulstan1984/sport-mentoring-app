"use client";

import { useActionState, useState } from "react";
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
  const [state, formAction, isPending] = useActionState(saveImprovementWayRatings, null);
  const [scores, setScores] = useState<Record<number, number>>(
    Object.fromEntries(ways.map((w) => [w.id, ratingMap[w.id]?.score ?? DEFAULT_SCORE]))
  );

  const alreadySubmitted = Object.values(ratingMap).length > 0;

  return (
    <form action={formAction} className="space-y-4">
      {alreadySubmitted && (
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

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Se salvează..." : "Salvează evaluarea"}
      </button>
    </form>
  );
}
