"use client";

import { useState } from "react";
import type { Player, PlayfieldPosition } from "@/app/generated/prisma/client";
import { PlayerProfileForm } from "../PlayerProfileForm";

export function PlayerProfileEditor({
  player,
  positions,
}: {
  player: Pick<Player, "id" | "name" | "team" | "dateOfBirth" | "playfieldPositionId">;
  positions: PlayfieldPosition[];
}) {
  const [isOpen, setIsOpen] = useState(false);

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
          <PlayerProfileForm
            player={player}
            positions={positions}
            onSuccess={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
