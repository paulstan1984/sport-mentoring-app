"use client";

import { useRouter } from "next/navigation";

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface JournalDayPickerProps {
  selectedDay: Date;
}

export function JournalDayPicker({ selectedDay }: JournalDayPickerProps) {
  const router = useRouter();

  return (
    <div>
      <label htmlFor="journal-day" className="label text-xs mb-1.5 block">
        Selectează ziua
      </label>
      <input
        id="journal-day"
        type="date"
        defaultValue={formatDateInput(selectedDay)}
        onChange={(e) => {
          const value = e.target.value;
          if (value) {
            const params = new URLSearchParams({ day: value });
            router.push(`/player/journal?${params.toString()}`);
          }
        }}
        className="input text-sm"
      />
    </div>
  );
}
