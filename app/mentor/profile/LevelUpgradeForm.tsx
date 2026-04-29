"use client";

import { useActionState } from "react";
import { requestLevelUpgrade } from "@/actions/mentor";
import type { MentorLevel } from "@/app/generated/prisma/client";

const LEVEL_LABELS: Record<MentorLevel, string> = {
  FREE: "Gratuit (1 client)",
  MINIMUM: "Minimum (5 clienți, 50 lei/lună)",
  MEDIUM: "Medium (10 clienți, 70 lei/lună)",
  PRO: "Pro (30 clienți, 100 lei/lună)",
  ENTERPRISE: "Enterprise (preț personalizat)",
};

const LEVEL_ORDER: MentorLevel[] = ["FREE", "MINIMUM", "MEDIUM", "PRO", "ENTERPRISE"];

const LEVEL_BADGE_COLORS: Record<MentorLevel, string> = {
  FREE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  MINIMUM: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  PRO: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  ENTERPRISE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
};

type Props = {
  currentLevel: MentorLevel;
  hasPendingRequest: boolean;
};

export function LevelUpgradeForm({ currentLevel, hasPendingRequest }: Props) {
  const wrappedAction = async (
    prev: Awaited<ReturnType<typeof requestLevelUpgrade>> | null,
    formData: FormData
  ) => {
    try { return await requestLevelUpgrade(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);

  const availableLevels = LEVEL_ORDER.filter((l) => LEVEL_ORDER.indexOf(l) > LEVEL_ORDER.indexOf(currentLevel));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Nivel curent:</span>
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_BADGE_COLORS[currentLevel]}`}>
          {LEVEL_LABELS[currentLevel].split(" (")[0]}
        </span>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {currentLevel === "ENTERPRISE"
          ? "Ești pe cel mai înalt nivel disponibil."
          : `Pachetele disponibile: Minimum (5 clienți, 50 lei/lună), Medium (10 clienți, 70 lei/lună), Pro (30 clienți, 100 lei/lună), Enterprise (personalizat).`}
      </div>

      {hasPendingRequest && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400 mb-4">
          Ai o cerere de upgrade în așteptare. Vei fi notificat după procesare.
        </div>
      )}

      {!hasPendingRequest && currentLevel !== "ENTERPRISE" && availableLevels.length > 0 && (
        <form action={formAction} className="space-y-3">
          <div>
            <label className="label">Nivel dorit</label>
            <select name="requestedLevel" className="input" required>
              {availableLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {LEVEL_LABELS[lvl]}
                </option>
              ))}
            </select>
          </div>
          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Cererea de upgrade a fost trimisă! Administratorul o va procesa în curând.
            </p>
          )}
          <button type="submit" disabled={isPending} className="btn-primary text-sm">
            {isPending ? "Se trimite..." : "Solicită upgrade"}
          </button>
        </form>
      )}
    </div>
  );
}
