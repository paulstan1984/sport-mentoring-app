"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { submitCheckin } from "@/actions/player";
import type { CheckinFormItem, CheckinAnswer } from "@/app/generated/prisma/client";
import { CheckCircle2, Circle } from "lucide-react";

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
    if (navigator.onLine) return;
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
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4">
      {!isOnline && (
        <div className="kit-warning-banner">
          Ești offline. Datele vor fi salvate local și sincronizate automat.
        </div>
      )}
      {alreadySubmitted && isOnline && (
        <div className="kit-success-banner">
          Ai completat checkin-ul de astăzi. Poți actualiza oricând.
        </div>
      )}

      {/* Item rows */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--kit-border)" }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="transition-colors"
            style={{
              background: checked[item.id] ? "rgba(34,197,94,0.07)" : "var(--kit-surface)",
              borderBottom: idx < items.length - 1 ? "1px solid var(--kit-border)" : "none",
            }}
          >
            <label className="flex items-center gap-4 px-4 py-4 cursor-pointer min-h-[60px]">
              <input
                name={`flag_${item.id}`}
                type="checkbox"
                checked={checked[item.id] ?? false}
                onChange={(e) =>
                  setChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))
                }
                className="sr-only"
              />
              <span className="shrink-0">
                {checked[item.id] ? (
                  <CheckCircle2 size={24} strokeWidth={2.5} style={{ color: "var(--kit-success)" }} />
                ) : (
                  <Circle size={24} strokeWidth={1.5} style={{ color: "var(--kit-text-3)" }} />
                )}
              </span>
              <span
                className="text-sm font-medium flex-1 leading-snug"
                style={{ color: checked[item.id] ? "var(--kit-text)" : "var(--kit-text-2)" }}
              >
                {item.label}
              </span>
            </label>

            {item.allowAdditionalString && checked[item.id] && (
              <div className="px-4 pb-4">
                <input
                  name={`string_${item.id}`}
                  type="text"
                  defaultValue={answerMap[item.id]?.stringValue ?? ""}
                  placeholder="Detalii suplimentare..."
                  className="input text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {state?.error && <div className="kit-error-banner">{state.error}</div>}
      {state?.success && <div className="kit-success-banner">Checkin-ul a fost salvat!</div>}
      {offlineQueued && !isOnline && (
        <div className="kit-info-banner">
          Checkin-ul a fost salvat local. Va fi sincronizat automat.
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Se salvează..." : "Salvează checkin-ul"}
      </button>
    </form>
  );
}
