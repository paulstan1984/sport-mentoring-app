"use client";

import { useActionState } from "react";
import { importPlayersFromCsv } from "@/actions/mentor";

export function PlayerCsvImport() {
  const wrappedAction = async (
    prev: Awaited<ReturnType<typeof importPlayersFromCsv>> | null,
    formData: FormData
  ) => {
    try { return await importPlayersFromCsv(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-base font-semibold">Import CSV jucători</h3>
        <a
          href="/api/mentor/players-template"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
          download
        >
          Descarcă șablon CSV
        </a>
      </div>

      <form action={formAction} className="flex flex-col sm:flex-row gap-2">
        <input
          type="file"
          name="csvFile"
          accept=".csv,text/csv"
          required
          className="input file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
        />
        <button type="submit" disabled={isPending} className="btn-primary sm:shrink-0">
          {isPending ? "Se importă..." : "Importă CSV"}
        </button>
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Format coloane: username,password,name,team,dateOfBirth,playfieldPosition
      </p>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      {state?.summary && (
        <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
          {state.summary}
        </p>
      )}

      {state?.issues && state.issues.length > 0 && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 p-3">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
            Primele probleme identificate:
          </p>
          <ul className="space-y-1">
            {state.issues.map((issue) => (
              <li key={issue} className="text-xs text-amber-800 dark:text-amber-200">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}