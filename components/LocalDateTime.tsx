'use client';

interface LocalDateTimeProps {
  date: string | Date;
}

/**
 * Renders a UTC date as a formatted local date+time string using the browser's timezone.
 * Format: "21 martie 2026 14:35"
 */
export function LocalDateTime({ date }: LocalDateTimeProps) {
  const d = new Date(date);
  const datePart = d.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return <>{datePart} {timePart}</>;
}
