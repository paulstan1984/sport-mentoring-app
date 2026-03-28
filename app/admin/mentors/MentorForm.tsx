"use client";

import { useActionState } from "react";
import { createMentor } from "@/actions/admin";

export function MentorForm() {
  const [state, formAction, isPending] = useActionState(createMentor, null);

  return (
    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="label">Utilizator *</label>
        <input name="username" required className="input" placeholder="ex: mentor1" />
      </div>
      <div>
        <label className="label">Parolă *</label>
        <input name="password" type="password" required className="input" placeholder="min. 8 caractere" />
      </div>
      <div>
        <label className="label">Nume complet *</label>
        <input name="name" required className="input" placeholder="ex: Ion Popescu" />
      </div>
      <div>
        <label className="label">Fotografie profil</label>
        <input
          name="photo"
          type="file"
          accept=".jpg,.jpeg,.png,.gif"
          className="input py-1.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200 cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">JPG, PNG sau GIF, max 20 MB (opțional)</p>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Descriere scurtă</label>
        <textarea name="description" className="input resize-none" rows={2} placeholder="Câteva cuvinte despre mentor" />
      </div>

      {state?.error && (
        <div className="sm:col-span-2">
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        </div>
      )}
      {state?.success && (
        <div className="sm:col-span-2">
          <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
            Mentorul a fost adăugat.
          </p>
        </div>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
        >
          {isPending ? "Se salvează..." : "Adaugă Mentor"}
        </button>
      </div>
    </form>
  );
}
