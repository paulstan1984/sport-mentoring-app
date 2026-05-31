"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

interface Props {
  defaultTitle?: string;
  defaultBody?: string;
}

export function MentorSendPushButton({ defaultTitle, defaultBody }: Props) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(defaultTitle ?? "Reminder checkin");
  const [body, setBody] = useState(defaultBody ?? "Nu uita să completezi checkin-ul de astăzi!");

  async function handleSend() {
    setSending(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url: "/player/checkin" }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Eroare la trimiterea notificărilor.");
        return;
      }

      const json = await res.json();
      setResult(json);
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Titlu notificare</label>
        <input
          type="text"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>
      <div>
        <label className="label">Mesaj notificare</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={300}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim()}
        className="btn-primary flex items-center gap-2"
      >
        <Bell size={16} />
        {sending ? "Se trimite..." : "Trimite notificare push jucătorilor"}
      </button>

      {result !== null && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {result.sent > 0
            ? `Notificare trimisă la ${result.sent} dispozitiv${result.sent === 1 ? "" : "e"}.`
            : "Niciun jucător nu are notificările push activate."}
        </p>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
