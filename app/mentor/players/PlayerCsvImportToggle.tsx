"use client";

import { useState } from "react";
import { PlayerCsvImport } from "./PlayerCsvImport";

export function PlayerCsvImportToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn-secondary"
      >
        📥 Importă Jucători
      </button>

      {open && (
        <div className="mt-4">
          <PlayerCsvImport />
        </div>
      )}
    </div>
  );
}
