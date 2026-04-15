"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteOrphanUsers } from "@/actions/admin";

export default function ToolsClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);

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

  return (
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
  );
}
