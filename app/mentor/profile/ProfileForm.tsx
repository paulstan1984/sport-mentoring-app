"use client";

import { useActionState, useRef, useState } from "react";
import { updateMentorProfile, changeMentorPassword } from "@/actions/mentor";
import type { Mentor, User } from "@/app/generated/prisma/client";

type MentorWithUser = Mentor & { user: Pick<User, "username"> };

export function ProfileForm({ mentor }: { mentor: MentorWithUser }) {
  const wrappedUpdate = async (
    prev: Awaited<ReturnType<typeof updateMentorProfile>> | null,
    formData: FormData
  ) => {
    try { return await updateMentorProfile(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [state, formAction, isPending] = useActionState(wrappedUpdate, null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(mentor.photo);
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
      const res = await fetch("/api/upload-photo", { method: "POST", body: data });
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
      <div>
        <label className="label">Fotografie profil</label>
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
              {mentor.name.charAt(0).toUpperCase()}
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

      {/* Profile details form */}
      <form action={formAction} className="space-y-4">
        <div>
          <label className="label">Utilizator</label>
          <input value={mentor.user.username} disabled className="input opacity-60" />
        </div>
        <div>
          <label className="label">Nume complet *</label>
          <input name="name" defaultValue={mentor.name} required className="input" />
        </div>
        <div>
          <label className="label">Descriere</label>
          <textarea name="description" defaultValue={mentor.description ?? ""} rows={3} className="input resize-none" />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-600">Profilul a fost actualizat.</p>}

        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Se salvează..." : "Salvează"}
        </button>
      </form>
    </div>
  );
}

export function PasswordForm() {
  const wrappedAction = async (
    prev: Awaited<ReturnType<typeof changeMentorPassword>> | null,
    formData: FormData
  ) => {
    try { return await changeMentorPassword(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Parola curentă</label>
        <input name="currentPassword" type="password" required className="input" />
      </div>
      <div>
        <label className="label">Parola nouă (min. 8 caractere)</label>
        <input name="newPassword" type="password" required className="input" />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Parola a fost schimbată.</p>}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Se procesează..." : "Schimbă parola"}
      </button>
    </form>
  );
}
