"use client";

import { useRouter } from "next/navigation";

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface CheckinDayPickerProps {
  selectedDay: Date;
}

export function CheckinDayPicker({ selectedDay }: CheckinDayPickerProps) {
  const router = useRouter();

  return (
    <div>
      <label htmlFor="checkin-day" className="label text-xs mb-1.5 block">
        Selectează ziua
      </label>
      <input
        id="checkin-day"
        type="date"
        defaultValue={formatDateInput(selectedDay)}
        onChange={(e) => {
          const value = e.target.value;
          if (value) {
            const params = new URLSearchParams({ day: value });
            router.push(`/player/checkin?${params.toString()}`);
          }
        }}
        className="input text-sm"
      />
    </div>
  );
}
