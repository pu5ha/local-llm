/** `now` is an optional param so this is testable without fake timers. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMin = Math.max(0, Math.round((now.getTime() - Date.parse(iso)) / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}
