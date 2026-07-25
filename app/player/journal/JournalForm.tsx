"use client";

import { useActionState, useState, useEffect } from "react";
import { submitJournal } from "@/actions/player";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { DailyJournal } from "@/app/generated/prisma/client";

export function JournalForm({ existing }: { existing: DailyJournal | null }) {
  const wrappedAction = async (
    prev: Awaited<ReturnType<typeof submitJournal>> | null,
    formData: FormData
  ) => {
    try {
      return await submitJournal(prev, formData);
    } catch {
      return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." };
    }
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);
  const [score, setScore] = useState(existing?.myScore ?? 0);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (navigator.onLine) return;
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const today = new Date().toISOString().split("T")[0];
    const { enqueue } = await import("@/lib/offline-db");
    await enqueue({
      type: "journal",
      endpoint: "/api/sync/journal",
      payload: {
        whatDidGood: (formData.get("whatDidGood") as string) || null,
        whatDidWrong: (formData.get("whatDidWrong") as string) || null,
        whatCanDoBetter: (formData.get("whatCanDoBetter") as string) || null,
        myScore: Math.min(5, Math.max(0, Number(formData.get("myScore")) || 0)),
        day: today,
      },
      day: today,
    });
    setOfflineQueued(true);
    window.dispatchEvent(new CustomEvent("offline-enqueued"));
  };

  const sections = [
    {
      name: "whatDidGood",
      label: "Ce am făcut bine azi",
      placeholder: "Descrie ce a mers bine...",
      accentColor: "var(--kit-success)",
      initial: existing?.whatDidGood ?? "",
    },
    {
      name: "whatDidWrong",
      label: "Ce am greșit azi",
      placeholder: "Fii sincer cu tine însuți...",
      accentColor: "var(--kit-danger)",
      initial: existing?.whatDidWrong ?? "",
    },
    {
      name: "whatCanDoBetter",
      label: "Ce pot face mai bine mâine",
      placeholder: "Un pas concret spre îmbunătățire...",
      accentColor: "var(--kit-warning)",
      initial: existing?.whatCanDoBetter ?? "",
    },
  ];

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      {!isOnline && (
        <div className="kit-warning-banner">
          Ești offline. Datele vor fi salvate local și sincronizate automat.
        </div>
      )}
      {existing && isOnline && (
        <div className="kit-success-banner">
          Ai completat jurnalul de astăzi. Poți actualiza oricând.
        </div>
      )}

      {sections.map((s) => (
        <div
          key={s.name}
          className="rounded-2xl p-5 space-y-3"
          style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: s.accentColor }}
            />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: s.accentColor }}>
              {s.label}
            </p>
          </div>
          <RichTextEditor
            name={s.name}
            initialValue={s.initial}
            placeholder={s.placeholder}
          />
        </div>
      ))}

      {/* Daily score */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--kit-text-2)" }}>
          Scorul zilei
        </p>
        <input type="hidden" name="myScore" value={score} />
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScore(s)}
              className="flex-1 h-11 rounded-xl font-display font-bold text-sm transition-all"
              style={{
                background: score === s ? "var(--kit-accent)" : "var(--kit-surface-2)",
                border: `1px solid ${score === s ? "var(--kit-accent)" : "var(--kit-border)"}`,
                color: score === s ? "#fff" : "var(--kit-text-3)",
                boxShadow: score === s ? "0 2px 12px var(--kit-accent-dim)" : "none",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {state?.error && <div className="kit-error-banner">{state.error}</div>}
      {state?.success && <div className="kit-success-banner">Jurnalul a fost salvat!</div>}
      {offlineQueued && !isOnline && (
        <div className="kit-info-banner">
          Jurnalul a fost salvat local. Va fi sincronizat automat.
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Se salvează..." : "Salvează jurnalul"}
      </button>
    </form>
  );
}


