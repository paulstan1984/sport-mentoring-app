"use client";

import { useActionState, useState, useEffect, useRef } from "react";
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
  const wrappedAction = async (
    prev: Awaited<ReturnType<typeof submitCheckin>> | null,
    formData: FormData
  ) => {
    try {
      return await submitCheckin(prev, formData);
    } catch {
      return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." };
    }
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);
  const [checked, setChecked] = useState<Record<number, boolean>>(
    Object.fromEntries(items.map((i) => [i.id, answerMap[i.id]?.checked ?? false]))
  );
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueued, setOfflineQueued] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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

  const alreadySubmitted = Object.values(answerMap).some((a) => a.checked);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (navigator.onLine) return; // let the form action proceed normally

    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const today = new Date().toISOString().split("T")[0];

    const answers = items.map((item) => ({
      flagId: item.id,
      checked: formData.get(`flag_${item.id}`) === "on",
      stringValue:
        item.allowAdditionalString && formData.get(`flag_${item.id}`) === "on"
          ? ((formData.get(`string_${item.id}`) as string) || null)
          : null,
    }));

    const { enqueue } = await import("@/lib/offline-db");
    await enqueue({
      type: "checkin",
      endpoint: "/api/sync/checkin",
      payload: { answers, day: today },
      day: today,
    });

    setOfflineQueued(true);
    window.dispatchEvent(new CustomEvent("offline-enqueued"));
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-xl text-sm">
          ⚠️ Ești offline. Datele vor fi salvate local și sincronizate automat când te reconectezi.
        </div>
      )}

      {alreadySubmitted && isOnline && (
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
      {offlineQueued && !isOnline && (
        <p className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-xl">
          💾 Checkin-ul a fost salvat local. Va fi sincronizat automat când te reconectezi.
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Se salvează..." : "Salvează checkin-ul"}
      </button>
    </form>
  );
}
