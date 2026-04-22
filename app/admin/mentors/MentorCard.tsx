"use client";

import { useActionState, useState } from "react";
import { deleteMentor, updateMentor, changeMentorPassword, toggleMentorActive, changeMentorLevel } from "@/actions/admin";
import { impersonateMentor } from "@/actions/auth";
import type { Mentor, User, MentorLevel } from "@/app/generated/prisma/client";

type MentorWithUser = Mentor & { user: Pick<User, "username"> };

const LEVEL_LABELS: Record<MentorLevel, string> = {
  FREE: "Gratuit",
  MINIMUM: "Minimum",
  MEDIUM: "Medium",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

const LEVEL_COLORS: Record<MentorLevel, string> = {
  FREE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  MINIMUM: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  PRO: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  ENTERPRISE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
};

export function MentorCard({ mentor }: { mentor: MentorWithUser }) {
  const [editing, setEditing] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [updateState, updateAction, isUpdating] = useActionState(updateMentor, null);
  const [pwdState, pwdAction, isPwdPending] = useActionState(changeMentorPassword, null);
  const [levelState, levelAction, isLevelPending] = useActionState(changeMentorLevel, null);

  async function handleDelete() {
    if (!confirm(`Ștergi mentorul "${mentor.name}"? Toți jucătorii săi vor fi șterși.`)) {
      return;
    }
    await deleteMentor(mentor.id);
  }

  async function handleToggleActive() {
    const action = mentor.isActive ? "dezactivezi" : "activezi";
    if (!confirm(`Ești sigur că vrei să ${action} mentorul "${mentor.name}"?`)) return;
    await toggleMentorActive(mentor.id);
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

        {/* Change level */}
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nivel cont</p>
          <form action={levelAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={mentor.id} />
            <select name="level" defaultValue={mentor.level} className="input text-sm py-1 w-auto">
              <option value="FREE">Gratuit</option>
              <option value="MINIMUM">Minimum</option>
              <option value="MEDIUM">Medium</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
            <button type="submit" disabled={isLevelPending} className="btn-primary text-sm">
              {isLevelPending ? "..." : "Schimbă"}
            </button>
          </form>
          {levelState?.error && <p className="text-sm text-red-600 mt-1">{levelState.error}</p>}
          {levelState?.success && <p className="text-sm text-green-600 mt-1">Nivelul a fost actualizat.</p>}
        </div>

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
    <div className={`bg-white dark:bg-gray-900 rounded-xl p-4 shadow ${!mentor.isActive ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm">{mentor.name}</p>
        {!mentor.isActive && (
          <span className="inline-block rounded bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 text-xs text-red-600 dark:text-red-400">
            dezactivat
          </span>
        )}
      </div>
      <p className="font-mono text-xs text-gray-500 mt-1">{mentor.user.username}</p>
      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{mentor.description ?? "Fără descriere"}</p>
      <div className="mt-2">
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[mentor.level]}`}>
          {LEVEL_LABELS[mentor.level]}
        </span>
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">
        <form action={impersonateMentor}>
          <input type="hidden" name="mentorId" value={mentor.id} />
          <button type="submit" className="btn-xs text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
            Impersonează
          </button>
        </form>
        <button onClick={() => setEditing(true)} className="btn-xs">
          Editează
        </button>
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
        <button onClick={handleDelete} className="btn-xs-danger">
          Șterge
        </button>
      </div>
    </div>
  );
}