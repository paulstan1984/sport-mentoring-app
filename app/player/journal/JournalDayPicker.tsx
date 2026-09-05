"use client";

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface JournalDayPickerProps {
  selectedDay: Date;
}

export function JournalDayPicker({ selectedDay }: JournalDayPickerProps) {
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
            window.location.href = `/player/journal?day=${value}`;
          }
        }}
        className="input text-sm"
      />
    </div>
  );
}
