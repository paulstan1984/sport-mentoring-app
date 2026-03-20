"use client";

import { useActionState } from "react";
import { createPlayer } from "@/actions/mentor";
import type { PlayfieldPosition } from "@/app/generated/prisma/client";

export function PlayerForm({
  positions,
}: {
  positions: PlayfieldPosition[];
}) {
  const [state, formAction, isPending] = useActionState(createPlayer, null);

  return (
    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="label">Utilizator *</label>
        <input name="username" required className="input" placeholder="ex: player1" />
      </div>
      <div>
        <label className="label">Parolă *</label>
        <input name="password" type="password" required className="input" placeholder="min. 8 caractere" />
      </div>
      <div>
        <label className="label">Nume complet *</label>
        <input name="name" required className="input" placeholder="ex: Andrei Ionescu" />
      </div>
      <div>
        <label className="label">Echipă</label>
        <input name="team" className="input" placeholder="ex: U17 Dinamo" />
      </div>
      <div>
        <label className="label">Data nașterii</label>
        <input name="dateOfBirth" type="date" className="input" />
      </div>
      <div>
        <label className="label">Poziție pe teren</label>
        <select name="playfieldPositionId" className="input">
          <option value="">— Selectează —</option>
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.name}
            </option>
          ))}
        </select>
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
            Jucătorul a fost adăugat.
          </p>
        </div>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Se salvează..." : "Adaugă Jucător"}
        </button>
      </div>
    </form>
  );
}
