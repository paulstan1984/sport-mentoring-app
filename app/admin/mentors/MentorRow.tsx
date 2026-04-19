"use client";

import { useState } from "react";
import { useActionState } from "react";
import { updateMentor, deleteMentor, changeMentorPassword, toggleMentorActive } from "@/actions/admin";
import { impersonateMentor } from "@/actions/auth";
import type { Mentor, User } from "@/app/generated/prisma/client";

type MentorWithUser = Mentor & { user: Pick<User, "username"> };

export function MentorRow({ mentor }: { mentor: MentorWithUser }) {
  const [editing, setEditing] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [updateState, updateAction, isUpdating] = useActionState(updateMentor, null);
  const [pwdState, pwdAction, isPwdPending] = useActionState(changeMentorPassword, null);

  async function handleDelete() {
    if (!confirm(`Ștergi mentorul "${mentor.name}"? Toți jucătorii săi vor fi șterși.`))
      return;
    await deleteMentor(mentor.id);
  }

  async function handleToggleActive() {
    const action = mentor.isActive ? "dezactivezi" : "activezi";
    if (!confirm(`Ești sigur că vrei să ${action} mentorul "${mentor.name}"?`)) return;
    await toggleMentorActive(mentor.id);
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
            <div className="col-span-2">
              <label className="label">Descriere</label>
              <textarea name="description" defaultValue={mentor.description ?? ""} className="input resize-none" rows={2} />
            </div>
            {updateState?.error && (
              <p className="col-span-2 text-sm text-red-600">{updateState.error}</p>
            )}
            {updateState?.success && (
              <p className="col-span-2 text-sm text-green-600">Datele au fost salvate.</p>
            )}
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={isUpdating} className="btn-primary text-sm">Salvează</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">Anulează</button>
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
        </td>
      </tr>
    );
  }

  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!mentor.isActive ? "opacity-60" : ""}`}>
      <td className="px-4 py-3 font-mono text-xs text-gray-500">
        {mentor.user.username}
        {!mentor.isActive && (
          <span className="ml-2 inline-block rounded bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 text-xs text-red-600 dark:text-red-400">
            dezactivat
          </span>
        )}
      </td>
      <td className="px-4 py-3 font-medium">{mentor.name}</td>
      <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-48">
        {mentor.description ?? "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 justify-end">
          <form action={impersonateMentor}>
            <input type="hidden" name="mentorId" value={mentor.id} />
            <button type="submit" className="btn-xs text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
              Impersonează
            </button>
          </form>
          <button onClick={() => setEditing(true)} className="btn-xs">Editează</button>
          <button
            onClick={handleToggleActive}
            className={`btn-xs ${
              mentor.isActive
                ? "text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                : "text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
            }`}
          >
            {mentor.isActive ? "Dezactivează" : "Activează"}
          </button>
          <button onClick={handleDelete} className="btn-xs-danger">Șterge</button>
        </div>
      </td>
    </tr>
  );
}
