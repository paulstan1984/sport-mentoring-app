"use client";

import { useActionState, useState } from "react";
import { deleteMentor, updateMentor, changeMentorPassword } from "@/actions/admin";
import type { Mentor, User } from "@/app/generated/prisma/client";

type MentorWithUser = Mentor & { user: Pick<User, "username"> };

export function MentorCard({ mentor }: { mentor: MentorWithUser }) {
  const [editing, setEditing] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [updateState, updateAction, isUpdating] = useActionState(updateMentor, null);
  const [pwdState, pwdAction, isPwdPending] = useActionState(changeMentorPassword, null);

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
            <label className="label">Fotografie profil</label>
            <input
              name="photo"
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              className="input py-1.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200 cursor-pointer"
            />
            {mentor.photo && (
              <p className="text-xs text-gray-400 mt-1 truncate">Curentă: {mentor.photo}</p>
            )}
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
          {updateState?.success && <p className="text-sm text-green-600">Datele au fost salvate.</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isUpdating} className="btn-primary text-sm">
              Salvează
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">
              Anulează
            </button>
          </div>
        </form>

        {/* Change password */}
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          {changingPwd ? (
            <form action={pwdAction} className="flex gap-2">
              <input type="hidden" name="id" value={mentor.id} />
              <input name="newPassword" type="password" className="input text-sm flex-1" placeholder="Parolă nouă (min. 8 car.)" required />
              <button type="submit" disabled={isPwdPending} className="btn-primary text-sm">Schimbă</button>
              <button type="button" onClick={() => setChangingPwd(false)} className="btn-secondary text-sm">Anulează</button>
            </form>
          ) : (
            <button onClick={() => setChangingPwd(true)} className="text-sm text-orange-600 hover:underline">
              Schimbă parola
            </button>
          )}
          {pwdState?.error && <p className="text-sm text-red-600 mt-1">{pwdState.error}</p>}
          {pwdState?.success && <p className="text-sm text-green-600 mt-1">Parola a fost schimbată.</p>}
        </div>
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