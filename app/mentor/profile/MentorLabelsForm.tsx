"use client";

import { useActionState } from "react";
import { updateMentorLabel } from "@/actions/mentor";

type Label = {
  key: string;
  value: string;
};

const LABEL_META: Record<string, { displayName: string; description: string; defaultValue: string }> = {
  players: {
    displayName: "Jucători",
    description: "Termenul folosit pentru a denumi jucătorii/clienții tăi.",
    defaultValue: "Clienți",
  },
};

export function MentorLabelsForm({ labels }: { labels: Label[] }) {
  const labelsMap = Object.fromEntries(labels.map((l) => [l.key, l.value]));

  return (
    <div className="space-y-4">
      {Object.entries(LABEL_META).map(([key, meta]) => {
        const currentValue = labelsMap[key] ?? meta.defaultValue;
        return (
          <LabelRow
            key={`${key}-${currentValue}`}
            labelKey={key}
            displayName={meta.displayName}
            description={meta.description}
            currentValue={currentValue}
            placeholder={meta.defaultValue}
          />
        );
      })}
    </div>
  );
}

function LabelRow({
  labelKey,
  displayName,
  description,
  currentValue,
  placeholder,
}: {
  labelKey: string;
  displayName: string;
  description: string;
  currentValue: string;
  placeholder: string;
}) {
  const [state, formAction, isPending] = useActionState(updateMentorLabel, null);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="key" value={labelKey} />
      <label className="label">
        {displayName}
        {description && (
          <span className="text-xs font-normal text-gray-500 ml-1">— {description}</span>
        )}
      </label>
      <div className="flex gap-2 items-center">
        <input
          name="value"
          defaultValue={currentValue}
          required
          className="input flex-1"
          placeholder={placeholder}
        />
        <button type="submit" disabled={isPending} className="btn-primary whitespace-nowrap">
          {isPending ? "Se salvează..." : "Salvează"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Eticheta a fost salvată.</p>}
    </form>
  );
}
