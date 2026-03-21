"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePlayer } from "@/actions/mentor";
import type { Player, PlayfieldPosition } from "@/app/generated/prisma/client";

export type EditablePlayerProfile = Pick<
  Player,
  "id" | "name" | "team" | "dateOfBirth" | "playfieldPositionId"
>;

export function PlayerProfileForm({
  player,
  positions,
  onSuccess,
  formClassName = "grid grid-cols-1 sm:grid-cols-2 gap-3",
  inputClassName = "input text-sm",
  actionsClassName = "sm:col-span-2",
  submitButtonClassName = "btn-primary text-sm",
  errorClassName = "sm:col-span-2 text-sm text-red-600",
  successClassName = "sm:col-span-2 text-sm text-green-600",
  submitLabel = "Salvează modificările",
  pendingLabel = "Se salvează...",
  secondaryAction,
}: {
  player: EditablePlayerProfile;
  positions: PlayfieldPosition[];
  onSuccess?: () => void;
  formClassName?: string;
  inputClassName?: string;
  actionsClassName?: string;
  submitButtonClassName?: string;
  errorClassName?: string;
  successClassName?: string;
  submitLabel?: string;
  pendingLabel?: string;
  secondaryAction?: ReactNode;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updatePlayer, null);

  useEffect(() => {
    if (!state?.success) return;

    onSuccess?.();
    router.refresh();
  }, [state?.success, onSuccess, router]);

  return (
    <form action={formAction} className={formClassName}>
      <input type="hidden" name="id" value={player.id} />

      <div>
        <label className="label">Nume *</label>
        <input name="name" defaultValue={player.name} required className={inputClassName} />
      </div>

      <div>
        <label className="label">Echipă</label>
        <input name="team" defaultValue={player.team ?? ""} className={inputClassName} />
      </div>

      <div>
        <label className="label">Data nașterii</label>
        <input
          name="dateOfBirth"
          type="date"
          defaultValue={
            player.dateOfBirth
              ? new Date(player.dateOfBirth).toISOString().slice(0, 10)
              : ""
          }
          className={inputClassName}
        />
      </div>

      <div>
        <label className="label">Poziție pe teren</label>
        <select
          name="playfieldPositionId"
          defaultValue={player.playfieldPositionId ?? ""}
          className={inputClassName}
        >
          <option value="">— Selectează —</option>
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.name}
            </option>
          ))}
        </select>
      </div>

      {state?.error && <p className={errorClassName}>{state.error}</p>}
      {state?.success && <p className={successClassName}>Profilul a fost actualizat.</p>}

      <div className={actionsClassName}>
        <button type="submit" disabled={isPending} className={submitButtonClassName}>
          {isPending ? pendingLabel : submitLabel}
        </button>
        {secondaryAction}
      </div>
    </form>
  );
}
