"use client";

import { useActionState } from "react";
import { approveMentorSignup } from "@/actions/admin";

type Props = {
  requestId: number;
  defaultUsername: string;
};

export function ApproveForm({ requestId, defaultUsername }: Props) {
  const [state, formAction, isPending] = useActionState(approveMentorSignup, null);

  if (state?.success) {
    return (
      <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Aprobat</p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="flex gap-2">
        <input
          name="username"
          required
          className="input text-xs py-1"
          placeholder="Utilizator"
          defaultValue={defaultUsername}
        />
        <input
          name="password"
          type="password"
          required
          className="input text-xs py-1"
          placeholder="Parolă (min 8 car.)"
        />
      </div>
      {state?.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button type="submit" disabled={isPending} className="btn-primary text-xs py-1 px-3">
        {isPending ? "Se aprobă..." : "Aprobă"}
      </button>
    </form>
  );
}
