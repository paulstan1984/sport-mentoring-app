"use client";

import { useActionState, useRef, useState } from "react";
import { changePlayerPassword } from "@/actions/player";
import type { Player, User, PlayfieldPosition } from "@/app/generated/prisma/client";

type PlayerWithRelations = Player & {
  user: Pick<User, "username">;
  playfieldPosition: PlayfieldPosition | null;
};

export function ProfileClient({ player }: { player: PlayerWithRelations }) {
  const [pwdState, pwdAction, isPwdPending] = useActionState(changePlayerPassword, null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(player.photo);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Tip de fișier neacceptat. Acceptăm JPG, PNG, GIF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload-player-photo", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? "Eroare la upload.");
      } else {
        setPhotoUrl(json.photoUrl);
      }
    } catch {
      setUploadError("Eroare de rețea.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      {/* Photo upload */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
        <h2 className="font-semibold mb-4">Fotografie profil</h2>
        <div className="flex items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Foto profil"
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {player.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className={`btn-secondary cursor-pointer${uploading ? " opacity-60 pointer-events-none" : ""}`}>
              {uploading ? "Se încarcă..." : "Alege fotografie"}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-gray-500">JPG, PNG sau GIF, max 20 MB</p>
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          </div>
        </div>
      </div>

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
