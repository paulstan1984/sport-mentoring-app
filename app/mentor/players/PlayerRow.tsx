"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  deletePlayer,
  resetPlayerPassword,
  togglePlayerActive,
} from "@/actions/mentor";
import { impersonatePlayer } from "@/actions/auth";
import type { Player, User, PlayfieldPosition } from "@/app/generated/prisma/client";
import { PlayerProfileForm } from "./PlayerProfileForm";

type PlayerWithRelations = Player & {
  user: Pick<User, "username">;
  playfieldPosition: PlayfieldPosition | null;
};

export function PlayerRow({
  player,
  positions,
  canImpersonate = false,
}: {
  player: PlayerWithRelations;
  positions: PlayfieldPosition[];
  canImpersonate?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [resettingPwd, setResettingPwd] = useState(false);
  const wrappedPwd = async (
    prev: Awaited<ReturnType<typeof resetPlayerPassword>> | null,
    formData: FormData
  ) => {
    try { return await resetPlayerPassword(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [pwdState, pwdAction, isPwdPending] = useActionState(wrappedPwd, null);

  async function handleDelete() {
    if (!confirm(`Ștergi jucătorul "${player.name}"?`)) return;
    await deletePlayer(player.id);
  }

  async function handleToggleActive() {
    const action = player.isActive ? "dezactivezi" : "activezi";
    if (!confirm(`Ești sigur că vrei să ${action} jucătorul "${player.name}"?`)) return;
    await togglePlayerActive(player.id);
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
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!player.isActive ? "opacity-60" : ""}`}>
      <td className="hidden sm:table-cell px-4 py-3 font-mono text-xs text-gray-500">
        {player.user.username}
        {!player.isActive && (
          <span className="ml-2 inline-block rounded bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 text-xs text-red-600 dark:text-red-400">
            dezactivat
          </span>
        )}
      </td>
      <td className="px-4 py-3 font-medium">
        <div className="flex items-center gap-2">
          {player.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photo}
              alt={player.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400 text-xs font-semibold">
              {player.name.charAt(0).toUpperCase()}
            </div>
          )}
          <Link href={`/mentor/players/${player.id}`} className="hover:text-blue-600 hover:underline">
            {player.name}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-400 text-xs">{player.team ?? "—"}</td>
      <td className="px-4 py-3 text-gray-400 text-xs">
        {player.playfieldPosition?.name ?? "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 justify-end">
          {canImpersonate && (
            <form action={impersonatePlayer}>
              <input type="hidden" name="playerId" value={player.id} />
              <button type="submit" className="btn-xs text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                Impersonează
              </button>
            </form>
          )}
          <button onClick={() => setEditing(true)} className="btn-xs flex items-center gap-1">
            <svg className="w-3 h-3 sm:hidden" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            <span className="hidden sm:inline">Editează</span>
          </button>
          <button
            onClick={handleToggleActive}
            className={`btn-xs ${
              player.isActive
                ? "text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                : "text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
            }`}
          >
            {player.isActive ? "Dezactivează" : "Activează"}
          </button>
          <button onClick={handleDelete} className="btn-xs-danger">Șterge</button>
        </div>
      </td>
    </tr>
  );
}
