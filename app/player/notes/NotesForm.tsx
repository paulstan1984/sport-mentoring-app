"use client";

import { useActionState, useState, useEffect } from "react";
import { savePlayerNote, deletePlayerNote } from "@/actions/player";
import { RichTextEditor } from "@/components/RichTextEditor";
import { RichTextViewer } from "@/components/RichTextViewer";
import type { PlayerPersonalNote } from "@/app/generated/prisma/client";

interface NotesFormProps {
  notes: PlayerPersonalNote[];
}

function formatDateInput(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function NoteForm({
  note,
  onClose,
}: {
  note?: PlayerPersonalNote;
  onClose: () => void;
}) {
  const wrappedAction = async (
    prev: Awaited<ReturnType<typeof savePlayerNote>> | null,
    formData: FormData
  ) => {
    try {
      return await savePlayerNote(prev, formData);
    } catch {
      return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." };
    }
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <form action={formAction} className="space-y-3">
      {note && <input type="hidden" name="noteId" value={note.id} />}
      <div>
        <label htmlFor="note-date" className="label text-xs mb-1.5 block">
          Data
        </label>
        <input
          id="note-date"
          name="date"
          type="date"
          defaultValue={formatDateInput(note?.date ?? new Date())}
          required
          className="input text-sm"
        />
      </div>
      <div>
        <label className="label text-xs mb-1.5 block">Conținut</label>
        <RichTextEditor
          name="content"
          initialValue={note?.content ?? ""}
          placeholder="Scrie notița ta aici..."
          minHeight="min-h-32"
        />
      </div>
      {state?.error && <div className="kit-error-banner">{state.error}</div>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? "Se salvează..." : note ? "Actualizează" : "Adaugă"}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Anulează
        </button>
      </div>
    </form>
  );
}

function NoteItem({ note }: { note: PlayerPersonalNote }) {
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm("Ștergi această notiță?")) return;
    await deletePlayerNote(note.id);
  }

  if (editing) {
    return (
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
      >
        <NoteForm note={note} onClose={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold" style={{ color: "var(--kit-text-3)" }}>
          {formatDate(note.date)}
        </p>
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

export function NotesForm({ notes }: NotesFormProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {!adding && (
        <button onClick={() => setAdding(true)} className="btn-primary w-full">
          + Notiță nouă
        </button>
      )}

      {adding && (
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--kit-surface)", border: "1px solid var(--kit-border)" }}
        >
          <NoteForm onClose={() => setAdding(false)} />
        </div>
      )}

      {notes.length === 0 && !adding && (
        <p className="text-sm" style={{ color: "var(--kit-text-2)" }}>
          Nu ai nicio notiță încă.
        </p>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
