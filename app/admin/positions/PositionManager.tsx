"use client";

import { useActionState } from "react";
import { useState } from "react";
import {
  createPosition,
  updatePosition,
  deletePosition,
} from "@/actions/admin";
import type { PlayfieldPosition } from "@/app/generated/prisma/client";

export function PositionManager({
  positions,
}: {
  positions: PlayfieldPosition[];
}) {
  const [createState, createAction, isCreating] = useActionState(
    createPosition,
    null
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [updateState, updateAction, isUpdating] = useActionState(
    updatePosition,
    null
  );

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Ștergi poziția "${name}"?`)) return;
    await deletePosition(id);
  }

  return (
    <div className="space-y-6">
      {/* Add position form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Adaugă poziție</h2>
        <form action={createAction} className="flex gap-2">
          <input
            name="name"
            required
            className="input flex-1"
            placeholder="ex: Portar, Fundaș central..."
          />
          <button type="submit" disabled={isCreating} className="btn-primary shrink-0">
            Adaugă
          </button>
        </form>
        {createState?.error && (
          <p className="text-sm text-red-600 mt-2">{createState.error}</p>
        )}
      </div>

      {/* Positions list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-100 dark:divide-gray-800">
        {positions.length === 0 && (
          <p className="px-4 py-6 text-center text-gray-400">
            Nu există poziții definite.
          </p>
        )}
        {positions.map((p) =>
          editingId === p.id ? (
            <div key={p.id} className="px-4 py-3 flex gap-2">
              <form action={updateAction} className="flex gap-2 flex-1">
                <input type="hidden" name="id" value={p.id} />
                <input name="name" defaultValue={p.name} required className="input flex-1 text-sm" />
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
              <span className="flex-1 text-sm">{p.name}</span>
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
