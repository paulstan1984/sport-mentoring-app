"use client";

import { useActionState, useState } from "react";
import { publishDailyMessage } from "@/actions/mentor";
import { RichTextEditor } from "@/components/RichTextEditor";

export function MessageEditor({
  currentMessage,
}: {
  currentMessage: string;
}) {
  const [state, formAction, isPending] = useActionState(publishDailyMessage, null);
  const [isOpen, setIsOpen] = useState(currentMessage.length === 0);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn-secondary text-sm"
      >
        {isOpen ? "Ascunde editorul" : "Editează mesajul"}
      </button>

      {isOpen && (
        <form action={formAction} className="space-y-4">
          <RichTextEditor
            name="message"
            initialValue={currentMessage}
            placeholder="Scrie mesajul zilei pentru jucătorii tăi..."
            minHeight="min-h-40"
          />

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg">
              Mesajul a fost publicat.
            </p>
          )}

          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? "Se publică..." : "Publică mesajul"}
          </button>
        </form>
      )}
    </div>
  );
}
