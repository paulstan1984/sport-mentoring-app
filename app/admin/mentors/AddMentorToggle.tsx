"use client";

import { useState } from "react";
import { MentorForm } from "./MentorForm";

export function AddMentorToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8">
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary">
          + Adaugă Mentor
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Adaugă Mentor</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary text-sm"
            >
              Anulează
            </button>
          </div>
          <MentorForm />
        </div>
      )}
    </div>
  );
}
