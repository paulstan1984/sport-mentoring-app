"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  deletePlayer,
  resetPlayerPassword,
} from "@/actions/mentor";
import type { Player, User, PlayfieldPosition } from "@/app/generated/prisma/client";
import { PlayerProfileForm } from "./PlayerProfileForm";

type PlayerWithRelations = Player & {
  user: Pick<User, "username">;
  playfieldPosition: PlayfieldPosition | null;
};

export function PlayerRow({
  player,
  positions,
}: {
  player: PlayerWithRelations;
  positions: PlayfieldPosition[];
}) {
  const [editing, setEditing] = useState(false);
  const [resettingPwd, setResettingPwd] = useState(false);
  const [pwdState, pwdAction, isPwdPending] = useActionState(resetPlayerPassword, null);

  async function handleDelete() {
    if (!confirm(`Ștergi jucătorul "${player.name}"?`)) return;
    await deletePlayer(player.id);
  }

  if (editing) {
    return (
      <tr className="bg-blue-50 dark:bg-blue-950">
        <td colSpan={5} className="px-4 py-4">
          <PlayerProfileForm
            player={player}
            positions={positions}
            onSuccess={() => setEditing(false)}
            formClassName="grid grid-cols-2 gap-3"
            actionsClassName="col-span-2 flex gap-2"
            submitButtonClassName="btn-primary text-sm"
            submitLabel="Salvează"
            errorClassName="col-span-2 text-sm text-red-600"
            successClassName="col-span-2 text-sm text-green-600"
            secondaryAction={
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary text-sm"
              >
                Anulează
              </button>
            }
          />

          {/* Reset password */}
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            {resettingPwd ? (
              <form action={pwdAction} className="flex gap-2">
                <input type="hidden" name="playerId" value={player.id} />
                <input name="newPassword" type="password" className="input text-sm flex-1" placeholder="Parolă nouă (min. 8 car.)" required />
                <button type="submit" disabled={isPwdPending} className="btn-primary text-sm">Resetează</button>
                <button type="button" onClick={() => setResettingPwd(false)} className="btn-secondary text-sm">Anulează</button>
              </form>
            ) : (
              <button onClick={() => setResettingPwd(true)} className="text-sm text-orange-600 hover:underline">
                Resetează parola
              </button>
            )}
            {pwdState?.error && <p className="text-sm text-red-600 mt-1">{pwdState.error}</p>}
            {pwdState?.success && <p className="text-sm text-green-600 mt-1">Parola a fost resetată.</p>}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-3 font-mono text-xs text-gray-500">{player.user.username}</td>
      <td className="px-4 py-3 font-medium">
        <Link href={`/mentor/players/${player.id}`} className="hover:text-blue-600 hover:underline">
          {player.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-gray-400 text-xs">{player.team ?? "—"}</td>
      <td className="px-4 py-3 text-gray-400 text-xs">
        {player.playfieldPosition?.name ?? "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditing(true)} className="btn-xs">Editează</button>
          <button onClick={handleDelete} className="btn-xs-danger">Șterge</button>
        </div>
      </td>
    </tr>
  );
}
