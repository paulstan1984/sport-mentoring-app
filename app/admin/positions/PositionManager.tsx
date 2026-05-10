"use client";

import { useActionState, useState, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  createPosition,
  updatePosition,
  deletePosition,
  reorderPosition,
} from "@/actions/admin";
import type { PlayfieldPosition, MentorTheme } from "@/app/generated/prisma/client";

const THEME_OPTIONS: { value: "" | MentorTheme; label: string }[] = [
  { value: "", label: "— Toate —" },
  { value: "SPORT_MENTOR", label: "Sport Mentor" },
  { value: "MIND_MENTOR", label: "Mind Mentor" },
];

const THEME_BADGE: Record<MentorTheme, string> = {
  SPORT_MENTOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  MIND_MENTOR: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const THEME_LABEL: Record<MentorTheme, string> = {
  SPORT_MENTOR: "Sport Mentor",
  MIND_MENTOR: "Mind Mentor",
};

export function PositionManager({
  positions,
}: {
  positions: PlayfieldPosition[];
}) {
  const wrappedCreate = async (
    prev: Awaited<ReturnType<typeof createPosition>> | null,
    formData: FormData
  ) => {
    try { return await createPosition(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [createState, createAction, isCreating] = useActionState(wrappedCreate, null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const wrappedUpdate = async (
    prev: Awaited<ReturnType<typeof updatePosition>> | null,
    formData: FormData
  ) => {
    try { return await updatePosition(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [updateState, updateAction, isUpdating] = useActionState(wrappedUpdate, null);

  const [filterTheme, setFilterTheme] = useState<"" | MentorTheme>("");
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Ștergi focusul "${name}"?`)) return;
    await deletePosition(id);
  }

  function handleReorder(id: number, direction: "up" | "down") {
    startTransition(async () => {
      await reorderPosition(id, direction);
    });
  }

  const filteredPositions = filterTheme
    ? positions.filter((p) => p.theme === filterTheme)
    : positions;

  return (
    <div className="space-y-6">
      {/* Add position form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Adaugă Focus</h2>
        <form action={createAction} className="flex flex-col sm:flex-row gap-2">
          <input
            name="name"
            required
            className="input flex-1"
            placeholder="ex: Motivație, Concentrare..."
          />
          <select name="theme" className="input sm:w-44 shrink-0">
            <option value="">— Temă —</option>
            <option value="SPORT_MENTOR">Sport Mentor</option>
            <option value="MIND_MENTOR">Mind Mentor</option>
          </select>
          <button type="submit" disabled={isCreating} className="btn-primary shrink-0">
            Adaugă
          </button>
        </form>
        {createState?.error && (
          <p className="text-sm text-red-600 mt-2">{createState.error}</p>
        )}
      </div>

      {/* Filter by theme */}
      <div className="flex gap-2 flex-wrap">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterTheme(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterTheme === opt.value
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Positions list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-100 dark:divide-gray-800">
        {filteredPositions.length === 0 && (
          <p className="px-4 py-6 text-center text-gray-400">
            Nu există focus-uri definite.
          </p>
        )}
        {filteredPositions.map((p) =>
          editingId === p.id ? (
            <div key={p.id} className="px-4 py-3 flex flex-col sm:flex-row gap-2">
              <form action={updateAction} className="flex flex-col sm:flex-row gap-2 flex-1">
                <input type="hidden" name="id" value={p.id} />
                <input name="name" defaultValue={p.name} required className="input flex-1 text-sm" />
                <select name="theme" defaultValue={p.theme ?? ""} className="input sm:w-44 text-sm">
                  <option value="">— Temă —</option>
                  <option value="SPORT_MENTOR">Sport Mentor</option>
                  <option value="MIND_MENTOR">Mind Mentor</option>
                </select>
                <button type="submit" disabled={isUpdating} className="btn-primary text-sm">
                  Salvează
                </button>
              </form>
              <button onClick={() => setEditingId(null)} className="btn-secondary text-sm">
                Anulează
              </button>
            </div>
          ) : (
            <div key={p.id} className="px-4 py-3 flex items-center gap-2">
              <div className="flex flex-col gap-0.5 mr-1">
                <button
                  onClick={() => handleReorder(p.id, "up")}
                  disabled={isPending}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-40"
                  title="Mută sus"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => handleReorder(p.id, "down")}
                  disabled={isPending}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-40"
                  title="Mută jos"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <span className="flex-1 text-sm">{p.name}</span>
              {p.theme && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${THEME_BADGE[p.theme]}`}>
                  {THEME_LABEL[p.theme]}
                </span>
              )}
              <button onClick={() => setEditingId(p.id)} className="btn-xs">
                Editează
              </button>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                className="btn-xs-danger"
              >
                Șterge
              </button>
            </div>
          )
        )}
        {updateState?.error && (
          <p className="px-4 pb-3 text-sm text-red-600">{updateState.error}</p>
        )}
      </div>
    </div>
  );
}
