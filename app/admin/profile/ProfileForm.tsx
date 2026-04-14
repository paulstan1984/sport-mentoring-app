"use client";

import { useActionState } from "react";
import { updateSuperAdminProfile, changeSuperAdminPassword } from "@/actions/admin";

export function ProfileForm({ username }: { username: string }) {
  const [state, formAction, isPending] = useActionState(updateSuperAdminProfile, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Utilizator</label>
        <input name="username" defaultValue={username} required className="input" />
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
  const [state, formAction, isPending] = useActionState(changeSuperAdminPassword, null);

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
