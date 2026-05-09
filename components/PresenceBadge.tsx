'use client';

import { useEffect, useState } from 'react';

interface PresenceBadgeProps {
  lastActiveAt: Date | null;
}

function getStatus(lastActiveAt: Date | null): 'online' | 'idle' | 'offline' {
  if (!lastActiveAt) return 'offline';
  const now = Date.now();
  const ms = now - new Date(lastActiveAt).getTime();
  if (ms <= 5 * 60 * 1000) return 'online';
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (new Date(lastActiveAt) >= startOfToday) return 'idle';
  return 'offline';
}

/**
 * Green  – active in last 5 min
 * Yellow – active today but not in last 5 min
 * Red    – not active today
 * Deferred to client mount to avoid SSR/hydration mismatch.
 */
export function PresenceBadge({ lastActiveAt }: PresenceBadgeProps) {
  const [status, setStatus] = useState<'online' | 'idle' | 'offline' | null>(null);

  useEffect(() => {
    setStatus(getStatus(lastActiveAt));
  }, [lastActiveAt]);

  if (!status) return <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />;

  if (status === 'online') return <span className="inline-block w-3 h-3 rounded-full bg-green-500" title="Online" />;
  if (status === 'idle') return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" title="Inactiv &gt;5min" />;
  return <span className="inline-block w-3 h-3 rounded-full bg-red-500" title="Offline" />;
}
