interface PresenceBadgeProps {
  lastActiveAt: Date | null;
}

/**
 * Green  – active in last 5 min
 * Yellow – active today but not in last 5 min
 * Red    – not active today
 */
export function PresenceBadge({ lastActiveAt }: PresenceBadgeProps) {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (!lastActiveAt) {
    return <span className="inline-block w-3 h-3 rounded-full bg-red-500" title="Offline" />;
  }

  const ms = now - new Date(lastActiveAt).getTime();
  const fiveMin = 5 * 60 * 1000;

  if (ms <= fiveMin) {
    return <span className="inline-block w-3 h-3 rounded-full bg-green-500" title="Online" />;
  }

  if (new Date(lastActiveAt) >= startOfToday) {
    return <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" title="Inactiv &gt;5min" />;
  }

  return <span className="inline-block w-3 h-3 rounded-full bg-red-500" title="Offline" />;
}
