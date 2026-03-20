"use client";

import { useActionState, useState } from "react";
import { submitJournal } from "@/actions/player";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { DailyJournal } from "@/app/generated/prisma/client";

export function JournalForm({ existing }: { existing: DailyJournal | null }) {
  const [state, formAction, isPending] = useActionState(submitJournal, null);
  const [score, setScore] = useState(existing?.myScore ?? 0);

  return (
    <form action={formAction} className="space-y-6">
      {existing && (
        <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm">
          ✅ Ai completat jurnalul de astăzi. Poți actualiza oricând.
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 space-y-5">
        <div>
          <label className="label text-green-600 dark:text-green-400">
            Ce am făcut bine azi 🌟
          </label>
          <RichTextEditor
            name="whatDidGood"
            initialValue={existing?.whatDidGood ?? ""}
            placeholder="Descrie ce a mers bine..."
          />
        </div>

        <div>
          <label className="label text-red-500">Ce am greșit azi 🔍</label>
          <RichTextEditor
            name="whatDidWrong"
            initialValue={existing?.whatDidWrong ?? ""}
            placeholder="Fii sincer cu tine însuți..."
          />
        </div>

        <div>
          <label className="label text-orange-500">
            Ce pot face mai bine mâine 🚀
          </label>
          <RichTextEditor
            name="whatCanDoBetter"
            initialValue={existing?.whatCanDoBetter ?? ""}
            placeholder="Un pas concret spre îmbunătățire..."
          />
        </div>

        <div>
          <label className="label">Punctajul zilei (0–5)</label>
          <input type="hidden" name="myScore" value={score} />
          <div className="flex gap-2 mt-1">
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScore(s)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                  score === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-xl">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-xl">
          Jurnalul a fost salvat! ✅
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Se salvează..." : "Salvează jurnalul"}
      </button>
    </form>
  );
}
