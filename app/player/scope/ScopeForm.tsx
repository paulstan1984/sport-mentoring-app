"use client";

import { useActionState, useState, useEffect } from "react";
import { saveWeeklyScope, toggleWeeklyScope } from "@/actions/player";
import { RichTextEditor } from "@/components/RichTextEditor";
import { RichTextViewer } from "@/components/RichTextViewer";
import { getWeekLabelFromWeekNumber, getISOWeek } from "@/lib/weekUtils";
import type { WeeklyScope } from "@/app/generated/prisma/client";

export function ScopeForm({
  currentScope,
  pastScopes,
}: {
  currentScope: WeeklyScope | null;
  pastScopes: WeeklyScope[];
}) {
  const wrappedSave = async (
    prev: Awaited<ReturnType<typeof saveWeeklyScope>> | null,
    formData: FormData
  ) => {
    try {
      return await saveWeeklyScope(prev, formData);
    } catch {
      return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." };
    }
  };
  const [saveState, saveAction, isSaving] = useActionState(wrappedSave, null);
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
    if (navigator.onLine) return; // let the form action proceed normally

    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scope = (formData.get("scope") as string) || null;
    const { weekNumber, year } = getISOWeek(new Date());
    const today = new Date().toISOString().split("T")[0];

    const { enqueue } = await import("@/lib/offline-db");
    await enqueue({
      type: "scope",
      endpoint: "/api/sync/scope",
      payload: { scope, weekNumber, year },
      day: today,
    });

    setOfflineQueued(true);
    window.dispatchEvent(new CustomEvent("offline-enqueued"));
  };

  return (
    <div className="space-y-6">
      {/* Current week scope */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 space-y-4">
        <h2 className="font-semibold">Ce îmi propun în această săptămână</h2>

        {!isOnline && (
          <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-xl text-sm">
            ⚠️ Ești offline. Datele vor fi salvate local și sincronizate automat când te reconectezi.
          </div>
        )}

        <form action={saveAction} onSubmit={handleSubmit}>
          <RichTextEditor
            name="scope"
            initialValue={currentScope?.scope ?? ""}
            placeholder="Descrie obiectivul tău pentru această săptămână..."
            minHeight="min-h-36"
          />
          {saveState?.error && (
            <p className="text-sm text-red-600 mt-2">{saveState.error}</p>
          )}
          {saveState?.success && (
            <p className="text-sm text-green-600 mt-2">Obiectivul a fost salvat! ✅</p>
          )}
          {offlineQueued && !isOnline && (
            <p className="text-sm text-blue-600 mt-2">
              💾 Obiectivul a fost salvat local. Va fi sincronizat automat când te reconectezi.
            </p>
          )}
          <button type="submit" disabled={isSaving} className="btn-primary mt-4">
            {isSaving ? "Se salvează..." : "Salvează obiectivul"}
          </button>
        </form>

        {/* Accomplished toggle */}
        {currentScope && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 mb-2">Status la finalul săptămânii:</p>
            <div className="flex gap-2">
              <button
                onClick={() => toggleWeeklyScope(currentScope.id, true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentScope.accomplished === true
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900"
                }`}
              >
                ✅ Realizat
              </button>
              <button
                onClick={() => toggleWeeklyScope(currentScope.id, false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentScope.accomplished === false
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900"
                }`}
              >
                ❌ Nerealizat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Past scopes */}
      {pastScopes.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
          <h2 className="font-semibold mb-4">Obiective anterioare</h2>
          <div className="space-y-4">
            {pastScopes.map((s) => (
              <div key={s.id} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">
                    Săpt. {getWeekLabelFromWeekNumber(s.weekNumber, s.year)}
                  </span>
                  <span className={`text-xs font-medium ${
                    s.accomplished === true
                      ? "text-green-500"
                      : s.accomplished === false
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}>
                    {s.accomplished === true
                      ? "✅ Realizat"
                      : s.accomplished === false
                      ? "❌ Nerealizat"
                      : "—"}
                  </span>
                </div>
                <RichTextViewer html={s.scope} className="text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
