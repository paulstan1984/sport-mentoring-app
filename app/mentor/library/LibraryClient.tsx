"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { deleteLibraryItem } from "@/actions/mentor";

type ReadItem = {
  player: { name: string };
};

type LibraryItemData = {
  id: number;
  name: string;
  fileType: string;
  createdAt: Date;
  reads: ReadItem[];
};

type PlayerItem = { id: number; name: string };

export function LibraryClient({
  items,
  players,
  mentorId,
}: {
  items: LibraryItemData[];
  players: PlayerItem[];
  mentorId: number;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) {
        let errorMsg = "Eroare la upload.";
        try {
          const json = await res.json();
          errorMsg = json.error ?? errorMsg;
        } catch {
          // Server returned non-JSON; keep generic message
        }
        setUploadError(errorMsg);
      } else {
        formRef.current?.reset();
        router.refresh();
      }
    } catch {
      setUploadError("Eroare de rețea.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Ștergi acest element din bibliotecă?")) return;
    await deleteLibraryItem(id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Upload form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold">Adaugă material</h2>
          <button
            type="button"
            onClick={() => setShowUploadForm((prev) => !prev)}
            className="btn-secondary text-sm"
          >
            {showUploadForm ? "Ascunde formularul" : "Arată formularul"}
          </button>
        </div>

        {showUploadForm && (
          <form ref={formRef} onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="label">Nume material *</label>
              <input name="name" required className="input" placeholder="ex: Tehnica pasei" />
            </div>
            <div>
              <label className="label">Fișier (PDF, DOC, imagine) *</label>
              <input name="file" type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" className="input file:mr-2 file:btn-xs" />
            </div>
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? "Se încarcă..." : "Încarcă fișier"}
            </button>
          </form>
        )}
      </div>

      {/* Library items */}
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-gray-400 text-sm">Nu există materiale în bibliotecă.</p>
        )}
        {items.map((item) => {
          const readNames = item.reads.map((r) => r.player.name);
          const unreadPlayers = players.filter(
            (p) => !readNames.includes(p.name)
          );

          return (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <a
                    href={`/api/files/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {item.name}
                  </a>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.fileType} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString("ro-RO")}
                  </p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="btn-xs-danger shrink-0">
                  Șterge
                </button>
              </div>

              {/* Read status per player */}
              {players.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {players.map((p) => {
                    const hasRead = readNames.includes(p.name);
                    return (
                      <span
                        key={p.id}
                        className={`text-xs px-2 py-1 rounded-full ${
                          hasRead
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        }`}
                      >
                        {hasRead ? "✅" : "⬜"} {p.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
