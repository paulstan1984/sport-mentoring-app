"use client";

import { useState } from "react";
import { useActionState } from "react";
import { updateMentor, deleteMentor } from "@/actions/admin";
import type { Mentor, User } from "@/app/generated/prisma/client";

type MentorWithUser = Mentor & { user: Pick<User, "username"> };

export function MentorRow({ mentor }: { mentor: MentorWithUser }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, isUpdating] = useActionState(updateMentor, null);

  async function handleDelete() {
    if (!confirm(`Ștergi mentorul "${mentor.name}"? Toți jucătorii săi vor fi șterși.`))
      return;
    await deleteMentor(mentor.id);
  }

  if (editing) {
    return (
      <tr className="bg-blue-50 dark:bg-blue-950">
        <td colSpan={4} className="px-4 py-4">
          <form action={updateAction} className="grid grid-cols-2 gap-3">
            <input type="hidden" name="id" value={mentor.id} />
            <div>
              <label className="label">Nume *</label>
              <input name="name" defaultValue={mentor.name} required className="input" />
            </div>
            <div>
              <label className="label">Foto (URL)</label>
              <input name="photo" defaultValue={mentor.photo ?? ""} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Descriere</label>
              <textarea name="description" defaultValue={mentor.description ?? ""} className="input resize-none" rows={2} />
            </div>
            {updateState?.error && (
              <p className="col-span-2 text-sm text-red-600">{updateState.error}</p>
            )}
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={isUpdating} className="btn-primary text-sm">Salvează</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">Anulează</button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-3 font-mono text-xs text-gray-500">{mentor.user.username}</td>
      <td className="px-4 py-3 font-medium">{mentor.name}</td>
      <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-48">
        {mentor.description ?? "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(true)} className="btn-xs">Editează</button>
          <button onClick={handleDelete} className="btn-xs-danger">Șterge</button>
        </div>
      </td>
    </tr>
  );
}
