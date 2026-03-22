"use client";

import { useActionState, useState } from "react";
import { deleteMentor, updateMentor } from "@/actions/admin";
import type { Mentor, User } from "@/app/generated/prisma/client";

type MentorWithUser = Mentor & { user: Pick<User, "username"> };

export function MentorCard({ mentor }: { mentor: MentorWithUser }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, isUpdating] = useActionState(updateMentor, null);

  async function handleDelete() {
    if (!confirm(`Ștergi mentorul "${mentor.name}"? Toți jucătorii săi vor fi șterși.`)) {
      return;
    }
    await deleteMentor(mentor.id);
  }

  if (editing) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4">
        <form action={updateAction} className="grid grid-cols-1 gap-3">
          <input type="hidden" name="id" value={mentor.id} />
          <div>
            <label className="label">Nume *</label>
            <input name="name" defaultValue={mentor.name} required className="input" />
          </div>
          <div>
            <label className="label">Foto (URL)</label>
            <input name="photo" defaultValue={mentor.photo ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Descriere</label>
            <textarea
              name="description"
              defaultValue={mentor.description ?? ""}
              className="input resize-none"
              rows={2}
            />
          </div>
          {updateState?.error && <p className="text-sm text-red-600">{updateState.error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isUpdating} className="btn-primary text-sm">
              Salvează
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">
              Anulează
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
      <p className="font-medium text-sm">{mentor.name}</p>
      <p className="font-mono text-xs text-gray-500 mt-1">{mentor.user.username}</p>
      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{mentor.description ?? "Fără descriere"}</p>
      <div className="flex gap-2 mt-3">
        <button onClick={() => setEditing(true)} className="btn-xs">
          Editează
        </button>
        <button onClick={handleDelete} className="btn-xs-danger">
          Șterge
        </button>
      </div>
    </div>
  );
}