"use client";

import { useActionState, useState } from "react";
import { submitCheckin } from "@/actions/player";
import type { CheckinFormItem, CheckinAnswer } from "@/app/generated/prisma/client";

type AnswerMap = Record<number, CheckinAnswer>;

export function CheckinForm({
  items,
  answerMap,
}: {
  items: CheckinFormItem[];
  answerMap: AnswerMap;
}) {
  const [state, formAction, isPending] = useActionState(submitCheckin, null);
  const [checked, setChecked] = useState<Record<number, boolean>>(
    Object.fromEntries(items.map((i) => [i.id, answerMap[i.id]?.checked ?? false]))
  );

  const alreadySubmitted = Object.values(answerMap).some((a) => a.checked);

  return (
    <form action={formAction} className="space-y-4">
      {alreadySubmitted && (
        <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm">
          ✅ Ai completat checkin-ul de astăzi. Poți actualiza oricând.
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-100 dark:divide-gray-800">
        {items.map((item) => (
          <div key={item.id} className="px-5 py-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                name={`flag_${item.id}`}
                type="checkbox"
                checked={checked[item.id] ?? false}
                onChange={(e) =>
                  setChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))
                }
                className="mt-0.5 h-5 w-5 rounded accent-blue-600"
              />
              <span className="text-sm font-medium">{item.label}</span>
            </label>

            {item.allowAdditionalString && checked[item.id] && (
              <input
                name={`string_${item.id}`}
                type="text"
                defaultValue={answerMap[item.id]?.stringValue ?? ""}
                placeholder="Detalii suplimentare..."
                className="mt-2 ml-8 input text-sm"
              />
            )}
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
          Checkin-ul a fost salvat! ✅
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Se salvează..." : "Salvează checkin-ul"}
      </button>
    </form>
  );
}
