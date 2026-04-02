"use client";

import { useActionState, useState } from "react";
import {
  createImprovementWay,
  updateImprovementWay,
  deleteImprovementWay,
  moveImprovementWay,
} from "@/actions/mentor";
import { RichTextEditor } from "@/components/RichTextEditor";
import { RichTextViewer } from "@/components/RichTextViewer";
import type { ImprovementWay } from "@/app/generated/prisma/client";

function AddImprovementWayForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createImprovementWay, null);

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label">Titlu *</label>
        <input name="title" required className="input" placeholder="ex: Antrenament tehnic" />
      </div>
      <div>
        <label className="label">Descriere</label>
        <RichTextEditor
          name="description"
          placeholder="Descrie modul de îmbunătățire..."
          minHeight="min-h-24"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">Elementul a fost adăugat. ✅</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Se adaugă..." : "Adaugă element"}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">
          Anulează
        </button>
      </div>
    </form>
  );
}

function EditImprovementWayForm({
  way,
  onClose,
}: {
  way: ImprovementWay;
  onClose: () => void;
}) {
  const [state, action, isPending] = useActionState(updateImprovementWay, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={way.id} />
      <div>
        <label className="label">Titlu *</label>
        <input name="title" defaultValue={way.title} required className="input" />
      </div>
      <div>
        <label className="label">Descriere</label>
        <RichTextEditor
          name="description"
          initialValue={way.description ?? ""}
          minHeight="min-h-24"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">Salvat cu succes!</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          Salvează
        </button>
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Anulează
        </button>
      </div>
    </form>
  );
}

export function ImprovementWayBuilder({ ways }: { ways: ImprovementWay[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Ștergi acest element? Evaluările istorice vor fi păstrate.")) return;
    await deleteImprovementWay(id);
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
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
          <AddImprovementWayForm onClose={() => setShowAddForm(false)} />
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-4 py-3 text-sm font-medium text-gray-500">
          {ways.length} {ways.length === 1 ? "element" : "elemente"}
        </div>
        {ways.length === 0 && (
          <p className="px-4 py-6 text-center text-gray-400 text-sm">
            Nu există elemente. Adaugă mai sus.
          </p>
        )}
        {ways.map((way, idx) =>
          editingId === way.id ? (
            <div key={way.id} className="px-4 py-4 bg-blue-50 dark:bg-blue-950">
              <EditImprovementWayForm
                way={way}
                onClose={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div key={way.id} className="px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="text-gray-400 text-sm w-6 text-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{way.title}</p>
                  {way.description && (
                    <div className="mt-1">
                      <RichTextViewer html={way.description} className="text-xs text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => moveImprovementWay(way.id, "up")}
                    disabled={idx === 0}
                    className="btn-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveImprovementWay(way.id, "down")}
                    disabled={idx === ways.length - 1}
                    className="btn-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button onClick={() => setEditingId(way.id)} className="btn-xs">
                    Editează
                  </button>
                  <button onClick={() => handleDelete(way.id)} className="btn-xs-danger">
                    Șterge
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
