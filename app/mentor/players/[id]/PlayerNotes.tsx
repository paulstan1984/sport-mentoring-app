"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPlayerNote, updatePlayerNote, deletePlayerNote } from "@/actions/mentor";
import { RichTextEditor } from "@/components/RichTextEditor";
import { RichTextViewer } from "@/components/RichTextViewer";
import type { PlayerNote } from "@/app/generated/prisma/client";

const NOTES_RECENT = 3;
const NOTES_PAGE_SIZE = 3;

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

function paginate<T>(arr: T[], page: number): T[] {
  return arr.slice((page - 1) * NOTES_PAGE_SIZE, page * NOTES_PAGE_SIZE);
}

function calcTotalPages(count: number): number {
  return Math.max(1, Math.ceil(count / NOTES_PAGE_SIZE));
}

function CheckinPresenceField({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <input
        id="note-checkin-presence"
        name="checkinPresence"
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor="note-checkin-presence" className="label mb-0 cursor-pointer">
        Checkin (Prezența)
      </label>
    </div>
  );
}

function AddNoteForm({ playerId, onClose }: { playerId: number; onClose: () => void }) {
  const wrappedCreate = async (
    prev: Awaited<ReturnType<typeof createPlayerNote>> | null,
    formData: FormData
  ) => {
    try { return await createPlayerNote(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [state, action, isPending] = useActionState(wrappedCreate, null);
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
      <CheckinPresenceField />
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
  const wrappedUpdate = async (
    prev: Awaited<ReturnType<typeof updatePlayerNote>> | null,
    formData: FormData
  ) => {
    try { return await updatePlayerNote(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [state, action, isPending] = useActionState(wrappedUpdate, null);
  const dateValue = new Date(note.date).toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

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
      <CheckinPresenceField defaultChecked={note.checkinPresence} />
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
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-gray-400">{noteDate(note.date)}</p>
          {note.checkinPresence ? (
            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded px-2 py-0.5 font-medium">
              ✅ Prezent
            </span>
          ) : (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 rounded px-2 py-0.5">
              ⬜ Absent
            </span>
          )}
        </div>
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
  const [modalPage, setModalPage] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recentNotes = notes.slice(0, NOTES_RECENT);
  const totalPages = calcTotalPages(notes.length);

  function openModal() {
    setModalPage(1);
  }
  function closeModal() {
    setModalPage(null);
  }
  function changePage(p: number) {
    setModalPage(p);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  const modalNotes = modalPage !== null ? paginate(notes, modalPage) : [];

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Notițe antrenor</h2>
          <div className="flex items-center gap-3">
            {notes.length > NOTES_RECENT && (
              <button
                type="button"
                onClick={openModal}
                className="text-xs text-blue-500 hover:underline"
              >
                Vezi tot ({notes.length})
              </button>
            )}
            {!adding && (
              <button onClick={() => setAdding(true)} className="btn-xs">
                + Adaugă notiță
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {adding && (
            <AddNoteForm playerId={playerId} onClose={() => setAdding(false)} />
          )}

          {recentNotes.length === 0 && !adding && (
            <p className="text-sm text-gray-400">Nicio notiță.</p>
          )}

          {recentNotes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      </div>

      {/* History modal */}
      {modalPage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h3 className="font-semibold text-base">Notițe antrenor — Istoric complet</h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Închide"
              >
                <X size={20} />
              </button>
            </div>
            <div ref={scrollRef} className="overflow-y-auto px-6 py-4 flex-1">
              <div className="space-y-4">
                {modalNotes.length === 0 && (
                  <p className="text-sm text-gray-400">Nicio notiță.</p>
                )}
                {modalNotes.map((note) => (
                  <NoteItem key={note.id} note={note} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <button
                    type="button"
                    onClick={() => changePage(modalPage - 1)}
                    disabled={modalPage === 1}
                    className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>
                  <span className="text-sm text-gray-500">
                    Pagina {modalPage} din {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => changePage(modalPage + 1)}
                    disabled={modalPage === totalPages}
                    className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-40"
                  >
                    Următor <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



