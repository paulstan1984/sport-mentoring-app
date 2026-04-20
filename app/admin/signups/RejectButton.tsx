"use client";

import { rejectMentorSignup } from "@/actions/admin";
import { useTransition } from "react";

type Props = {
  requestId: number;
};

export function RejectButton({ requestId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleReject() {
    if (!confirm("Sigur vrei să respingi această cerere?")) return;
    startTransition(() => {
      rejectMentorSignup(requestId);
    });
  }

  return (
    <button
      onClick={handleReject}
      disabled={isPending}
      className="btn-xs-danger"
    >
      {isPending ? "..." : "Respinge"}
    </button>
  );
}
