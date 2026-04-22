"use client";

import { approveLevelUpgradeRequest } from "@/actions/admin";
import { useTransition } from "react";

type Props = {
  requestId: number;
};

export function ApproveLevelUpgradeButton({ requestId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    if (!confirm("Aprobi upgrade-ul de nivel pentru acest antrenor?")) return;
    startTransition(() => {
      approveLevelUpgradeRequest(requestId);
    });
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="btn-xs text-green-700 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
    >
      {isPending ? "..." : "Aprobă"}
    </button>
  );
}
