"use client";

import { useActionState } from "react";
import { updateMentorProfile, changeMentorPassword } from "@/actions/mentor";
import type { Mentor, User } from "@/app/generated/prisma/client";

type MentorWithUser = Mentor & { user: Pick<User, "username"> };

export function ProfileForm({ mentor }: { mentor: MentorWithUser }) {
  const [state, formAction, isPending] = useActionState(updateMentorProfile, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Utilizator</label>
        <input value={mentor.user.username} disabled className="input opacity-60" />
      </div>
      <div>
        <label className="label">Nume complet *</label>
        <input name="name" defaultValue={mentor.name} required className="input" />
      </div>
      <div>
        <label className="label">Foto (URL)</label>
        <input name="photo" defaultValue={mentor.photo ?? ""} className="input" placeholder="https://..." />
      </div>
      <div>
        <label className="label">Descriere</label>
        <textarea name="description" defaultValue={mentor.description ?? ""} rows={3} className="input resize-none" />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Profilul a fost actualizat.</p>}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Se salvează..." : "Salvează"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changeMentorPassword, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Parola curentă</label>
        <input name="currentPassword" type="password" required className="input" />
      </div>
      <div>
        <label className="label">Parola nouă (min. 8 caractere)</label>
        <input name="newPassword" type="password" required className="input" />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Parola a fost schimbată.</p>}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Se procesează..." : "Schimbă parola"}
      </button>
    </form>
  );
}
