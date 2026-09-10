"use client";

import { useActionState, useState } from "react";
import {
  updatePlayerSpecificCheckinFormItem,
  softDeletePlayerSpecificCheckinFormItem,
} from "@/actions/mentor";
import type { CheckinFormItem } from "@/app/generated/prisma/client";

export function PlayerCheckinItemsEditor({
  playerId,
  items,
}: {
  playerId: number;
  items: CheckinFormItem[];
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, editAction, isEditing] = useActionState(updatePlayerSpecificCheckinFormItem, null);

  async function handleDelete(id: number) {
    if (!confirm("Ștergi acest element personal de checkin?")) return;
    await softDeletePlayerSpecificCheckinFormItem(playerId, id);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-100 dark:divide-gray-800">
      <div className="px-4 py-3">
        <h2 className="font-semibold">Elemente personale de checkin</h2>
        <p className="text-xs mt-1 text-gray-500">Definite de jucător, editabile de mentor.</p>
      </div>

      {items.length === 0 && (
        <p className="px-4 py-6 text-sm text-gray-400">Jucătorul nu are încă elemente personale.</p>
      )}

      {items.map((item) =>
        editingId === item.id ? (
          <div key={item.id} className="px-4 py-4 bg-blue-50 dark:bg-blue-950">
            <form action={editAction} className="space-y-3">
              <input type="hidden" name="playerId" value={playerId} />
              <input type="hidden" name="id" value={item.id} />
              <div>
                <label className="label">Label *</label>
                <input name="label" defaultValue={item.label} required className="input" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  name="allowAdditionalString"
                  type="checkbox"
                  defaultChecked={item.allowAdditionalString}
                  className="rounded"
                />
                Permite câmp text suplimentar
              </label>
              {editState?.error && <p className="text-sm text-red-600">{editState.error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={isEditing} className="btn-primary text-sm">Salvează</button>
                <button type="button" onClick={() => setEditingId(null)} className="btn-secondary text-sm">Anulează</button>
              </div>
            </form>
          </div>
        ) : (
          <div key={item.id} className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              {item.allowAdditionalString && <span className="text-xs text-orange-500">+ câmp text</span>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditingId(item.id)} className="btn-xs">Editează</button>
              <button onClick={() => handleDelete(item.id)} className="btn-xs-danger">Șterge</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
