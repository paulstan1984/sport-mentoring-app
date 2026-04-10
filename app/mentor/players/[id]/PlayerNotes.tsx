"use client";

import { useState, useActionState, useEffect } from "react";
import { createPlayerNote, updatePlayerNote, deletePlayerNote } from "@/actions/mentor";
import { RichTextEditor } from "@/components/RichTextEditor";
import { RichTextViewer } from "@/components/RichTextViewer";
import type { PlayerNote } from "@/app/generated/prisma/client";

interface PlayerNotesProps {
  playerId: number;
  notes: PlayerNote[];
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function noteDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function AddNoteForm({ playerId, onClose }: { playerId: number; onClose: () => void }) {
  const [state, action, isPending] = useActionState(createPlayerNote, null);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (state?.success) {
      setEditorKey((k) => k + 1);
      onClose();
    }
  }, [state?.success, onClose]);

  return (
    <form
      action={action}
      className="space-y-3 bg-blue-50 dark:bg-blue-950 rounded-xl p-4"
    >
      <input type="hidden" name="playerId" value={playerId} />
      <div>
        <label className="label" htmlFor="note-date">
          Data
        </label>
        <input
          id="note-date"
          name="date"
          type="date"
          defaultValue={todayString()}
          required
          className="input text-sm"
        />
      </div>
      <div>
        <label className="label">Conținut</label>
        <RichTextEditor key={editorKey} name="content" placeholder="Scrie nota ta aici..." minHeight="min-h-24" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Nota a fost salvată.</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? "Se salvează..." : "Salvează"}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Anulează
        </button>
      </div>
    </form>
  );
}

function EditNoteForm({ note, onClose }: { note: PlayerNote; onClose: () => void }) {
  const [state, action, isPending] = useActionState(updatePlayerNote, null);
  const dateValue = new Date(note.date).toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-3 bg-blue-50 dark:bg-blue-950 rounded-xl p-4">
      <input type="hidden" name="noteId" value={note.id} />
      <div>
        <label className="label" htmlFor={`edit-note-date-${note.id}`}>
          Data
        </label>
        <input
          id={`edit-note-date-${note.id}`}
          name="date"
          type="date"
          defaultValue={dateValue}
          required
          className="input text-sm"
        />
      </div>
      <div>
        <label className="label">Conținut</label>
        <RichTextEditor name="content" initialValue={note.content} minHeight="min-h-24" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Nota a fost actualizată.</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? "Se salvează..." : "Salvează"}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Anulează
        </button>
      </div>
    </form>
  );
}

function NoteItem({ note }: { note: PlayerNote }) {
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm("Ștergi această notă?")) return;
    await deletePlayerNote(note.id);
  }

  if (editing) {
    return <EditNoteForm note={note} onClose={() => setEditing(false)} />;
  }

  return (
    <div className="border-l-4 border-purple-400 pl-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-gray-400">{noteDate(note.date)}</p>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="btn-xs">
            Editează
          </button>
          <button onClick={handleDelete} className="btn-xs-danger">
            Șterge
          </button>
        </div>
      </div>
      <RichTextViewer html={note.content} className="text-sm" />
    </div>
  );
}

export function PlayerNotes({ playerId, notes }: PlayerNotesProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Notițe antrenor</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-xs">
            + Adaugă notiță
          </button>
        )}
      </div>

      <div className="space-y-4">
        {adding && (
          <AddNoteForm playerId={playerId} onClose={() => setAdding(false)} />
        )}

        {notes.length === 0 && !adding && (
          <p className="text-sm text-gray-400">Nicio notiță.</p>
        )}

        {notes.map((note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
