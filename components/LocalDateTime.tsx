'use client';

import { useEffect, useState } from 'react';

interface LocalDateTimeProps {
  date: string | Date;
}

/**
 * Renders a UTC date as a formatted local date+time string using the browser's timezone.
 * Format: "21 martie 2026 14:35"
 * Deferred to client mount to avoid SSR/hydration mismatch.
 */
export function LocalDateTime({ date }: LocalDateTimeProps) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
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
    setFormatted(`${datePart} ${timePart}`);
  }, [date]);

  if (!formatted) return null;
  return <>{formatted}</>;
}
