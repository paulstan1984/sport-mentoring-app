"use client";

import { useActionState, useState } from "react";
import { updatePlayer } from "@/actions/mentor";
import type { Player, PlayfieldPosition } from "@/app/generated/prisma/client";

export function PlayerProfileEditor({
  player,
  positions,
}: {
  player: Pick<Player, "id" | "name" | "team" | "dateOfBirth" | "playfieldPositionId">;
  positions: PlayfieldPosition[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updatePlayer, null);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn-secondary text-sm"
      >
        {isOpen ? "Ascunde editarea" : "Editează profilul jucătorului"}
      </button>

      {isOpen && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
          <h2 className="font-semibold mb-4">Editează profilul</h2>
          <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="hidden" name="id" value={player.id} />

            <div>
              <label className="label">Nume *</label>
              <input name="name" defaultValue={player.name} required className="input text-sm" />
            </div>

            <div>
              <label className="label">Echipă</label>
              <input name="team" defaultValue={player.team ?? ""} className="input text-sm" />
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
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label">Poziție pe teren</label>
              <select
                name="playfieldPositionId"
                defaultValue={player.playfieldPositionId ?? ""}
                className="input text-sm"
              >
                <option value="">— Selectează —</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>

            {state?.error && (
              <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>
            )}
            {state?.success && (
              <p className="sm:col-span-2 text-sm text-green-600">Profilul a fost actualizat.</p>
            )}

            <div className="sm:col-span-2">
              <button type="submit" disabled={isPending} className="btn-primary text-sm">
                {isPending ? "Se salvează..." : "Salvează modificările"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
