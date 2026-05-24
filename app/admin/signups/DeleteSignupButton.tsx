"use client";

import { deleteAdminRequest } from "@/actions/admin";
import { useTransition } from "react";

type Props = {
  requestId: number;
};

export function DeleteSignupButton({ requestId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Sigur vrei să ștergi această înregistrare?")) return;
    startTransition(() => {
      deleteAdminRequest(requestId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="btn-xs-danger"
    >
      {isPending ? "..." : "Șterge"}
    </button>
  );
}
