"use client";

import { useState } from "react";
import { Trash2, Database, Upload } from "lucide-react";
import { deleteOrphanUsers } from "@/actions/admin";

export default function ToolsClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);

  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{ success?: boolean; error?: string } | null>(null);

  async function handleDeleteOrphans() {
    const confirmed = window.confirm(
      "Ești sigur că vrei să ștergi toți utilizatorii fără antrenor sau jucător asociat? Această acțiune nu poate fi anulată."
    );
    if (!confirmed) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await deleteOrphanUsers();
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestoreDb(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const fileInput = formEl.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput?.files?.length) {
      setRestoreResult({ error: "Selectează un fișier .db." });
      return;
    }
    const confirmed = window.confirm(
      "Această acțiune va înlocui complet baza de date curentă. Ești sigur că vrei să continui?"
    );
    if (!confirmed) return;

    setRestoreLoading(true);
    setRestoreResult(null);
    try {
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      const res = await fetch("/api/admin/restore-db", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setRestoreResult({ error: data.error ?? "Eroare la restaurarea bazei de date." });
      } else {
        setRestoreResult({ success: true });
        formEl.reset();
      }
    } catch {
      setRestoreResult({ error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." });
    } finally {
      setRestoreLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Delete orphan users */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              Șterge utilizatori orfani
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Șterge toți utilizatorii care nu au un antrenor sau jucător asociat și nu sunt super admin.
            </p>
          </div>
          <button
            onClick={handleDeleteOrphans}
            disabled={loading}
            className="btn-xs-danger flex items-center gap-1.5 shrink-0"
          >
            <Trash2 size={14} />
            {loading ? "Se procesează..." : "Execută"}
          </button>
        </div>

        {result && (
          <div
            className={`text-sm rounded-lg px-4 py-3 ${
              result.error
                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}
          >
            {result.error
              ? result.error
              : `Operațiune finalizată. ${result.count ?? 0} utilizator(i) șters(și).`}
          </div>
        )}
      </div>

      {/* Download DB */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              Descarcă baza de date
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Descarcă o copie a bazei de date SQLite pentru backup.
            </p>
          </div>
          <a
            href="/api/admin/download-db"
            download="app.db"
            className="btn-xs flex items-center gap-1.5 shrink-0"
          >
            <Database size={14} />
            Descarcă
          </a>
        </div>
      </div>

      {/* Restore DB */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            Restaurează baza de date
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Încarcă un fișier <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">.db</code> pentru a restaura baza de date. Această acțiune va suprascrie datele existente.
          </p>
        </div>
        <form onSubmit={handleRestoreDb} className="flex flex-col sm:flex-row gap-3 items-start">
          <input
            type="file"
            accept=".db"
            required
            className="input flex-1 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300"
          />
          <button
            type="submit"
            disabled={restoreLoading}
            className="btn-xs flex items-center gap-1.5 shrink-0"
          >
            <Upload size={14} />
            {restoreLoading ? "Se procesează..." : "Restaurează"}
          </button>
        </form>
        {restoreResult && (
          <div
            className={`text-sm rounded-lg px-4 py-3 ${
              restoreResult.error
                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}
          >
            {restoreResult.error
              ? restoreResult.error
              : "Baza de date a fost restaurată cu succes."}
          </div>
        )}
      </div>
    </div>
  );
}
