"use client";

import { useActionState } from "react";
import { updatePlayerObjective, changePlayerPassword } from "@/actions/player";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { Player, User, PlayfieldPosition } from "@/app/generated/prisma/client";

type PlayerWithRelations = Player & {
  user: Pick<User, "username">;
  playfieldPosition: PlayfieldPosition | null;
};

export function ProfileClient({ player }: { player: PlayerWithRelations }) {
  const [objState, objAction, isObjPending] = useActionState(updatePlayerObjective, null);
  const [pwdState, pwdAction, isPwdPending] = useActionState(changePlayerPassword, null);

  return (
    <div className="space-y-6">
      {/* Info card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 space-y-3">
        <h2 className="font-semibold">Informații profil</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400">Utilizator</p>
            <p className="font-mono mt-0.5">{player.user.username}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Echipă</p>
            <p className="mt-0.5">{player.team ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Poziție</p>
            <p className="mt-0.5">{player.playfieldPosition?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Data nașterii</p>
            <p className="mt-0.5">
              {player.dateOfBirth
                ? new Date(player.dateOfBirth).toLocaleDateString("ro-RO")
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Objective */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <h2 className="font-semibold mb-4">Obiectivul meu</h2>
        <form action={objAction} className="space-y-4">
          <RichTextEditor
            name="objective"
            initialValue={player.objective ?? ""}
            placeholder="Descrie obiectivul tău personal..."
          />
          {objState?.error && <p className="text-sm text-red-600">{objState.error}</p>}
          {objState?.success && <p className="text-sm text-green-600">Obiectivul a fost salvat.</p>}
          <button type="submit" disabled={isObjPending} className="btn-primary">
            {isObjPending ? "Se salvează..." : "Salvează obiectivul"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <h2 className="font-semibold mb-4">Schimbă parola</h2>
        <form action={pwdAction} className="space-y-4">
          <div>
            <label className="label">Parola curentă</label>
            <input name="currentPassword" type="password" required className="input" />
          </div>
          <div>
            <label className="label">Parola nouă (min. 8 caractere)</label>
            <input name="newPassword" type="password" required className="input" />
          </div>
          {pwdState?.error && <p className="text-sm text-red-600">{pwdState.error}</p>}
          {pwdState?.success && <p className="text-sm text-green-600">Parola a fost schimbată.</p>}
          <button type="submit" disabled={isPwdPending} className="btn-primary">
            {isPwdPending ? "Se procesează..." : "Schimbă parola"}
          </button>
        </form>
      </div>
    </div>
  );
}
