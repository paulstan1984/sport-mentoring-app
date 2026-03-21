"use client";

import { useActionState, useState } from "react";
import {
  addCheckinFormItem,
  updateCheckinFormItem,
  softDeleteCheckinFormItem,
  moveCheckinFormItem,
} from "@/actions/mentor";
import type { CheckinFormItem } from "@/app/generated/prisma/client";

export function CheckinFormBuilder({
  items,
}: {
  items: CheckinFormItem[];
}) {
  const [addState, addAction, isAdding] = useActionState(addCheckinFormItem, null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, editAction, isEditing] = useActionState(updateCheckinFormItem, null);
  const [showAddForm, setShowAddForm] = useState(false);

  async function handleDelete(id: number) {
    if (!confirm("Ștergi acest element? Răspunsurile istorice vor fi păstrate.")) return;
    await softDeleteCheckinFormItem(id);
  }

  return (
    <div className="space-y-6">
      {/* Add item form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold">Adaugă element</h2>
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="btn-secondary text-sm"
          >
            {showAddForm ? "Ascunde formularul" : "Arată formularul"}
          </button>
        </div>

        {showAddForm && (
          <form action={addAction} className="space-y-3">
            <div>
              <label className="label">Label *</label>
              <input name="label" required className="input" placeholder="ex: Am mers la antrenament" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input name="allowAdditionalString" type="checkbox" className="rounded" />
              Permite câmp text suplimentar
            </label>
            {addState?.error && (
              <p className="text-sm text-red-600">{addState.error}</p>
            )}
            <button type="submit" disabled={isAdding} className="btn-primary">
              {isAdding ? "Se adaugă..." : "Adaugă element"}
            </button>
          </form>
        )}
      </div>

      {/* Current items */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-4 py-3 text-sm font-medium text-gray-500">
          {items.length} {items.length === 1 ? "element" : "elemente"} în formular
        </div>
        {items.length === 0 && (
          <p className="px-4 py-6 text-center text-gray-400 text-sm">
            Formularul este gol. Adaugă elemente mai sus.
          </p>
        )}
        {items.map((item, idx) =>
          editingId === item.id ? (
            <div key={item.id} className="px-4 py-4 bg-blue-50 dark:bg-blue-950">
              <form action={editAction} className="space-y-3">
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
                {editState?.error && (
                  <p className="text-sm text-red-600">{editState.error}</p>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={isEditing} className="btn-primary text-sm">Salvează</button>
                  <button type="button" onClick={() => setEditingId(null)} className="btn-secondary text-sm">Anulează</button>
                </div>
              </form>
            </div>
          ) : (
            <div key={item.id} className="px-4 py-3 flex items-center gap-3">
              <span className="text-gray-400 text-sm w-6 text-center">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                {item.allowAdditionalString && (
                  <span className="text-xs text-orange-500">+ câmp text</span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => moveCheckinFormItem(item.id, "up")}
                  disabled={idx === 0}
                  className="btn-xs disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveCheckinFormItem(item.id, "down")}
                  disabled={idx === items.length - 1}
                  className="btn-xs disabled:opacity-30"
                >
                  ↓
                </button>
                <button onClick={() => setEditingId(item.id)} className="btn-xs">Editează</button>
                <button onClick={() => handleDelete(item.id)} className="btn-xs-danger">Șterge</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
