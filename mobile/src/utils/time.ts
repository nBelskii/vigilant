const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Renders a short, human-readable relative time ("Just now", "10 mins ago",
// "Updated 2 hours ago"). Falls back to a date for anything older than a week.
export function formatRelativeTime(timestamp: string, prefix?: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();

  if (diff < MINUTE) {
    return prefix ? `${prefix} just now` : "Just now";
  }
  if (diff < HOUR) {
    const mins = Math.round(diff / MINUTE);
    const label = `${mins} min${mins === 1 ? "" : "s"} ago`;
    return prefix ? `${prefix} ${label}` : label;
  }
  if (diff < DAY) {
    const hours = Math.round(diff / HOUR);
    const label = `${hours} hour${hours === 1 ? "" : "s"} ago`;
    return prefix ? `${prefix} ${label}` : label;
  }
  if (diff < 7 * DAY) {
    const days = Math.round(diff / DAY);
    const label = `${days} day${days === 1 ? "" : "s"} ago`;
    return prefix ? `${prefix} ${label}` : label;
  }

  const date = new Date(timestamp).toLocaleDateString("en-CA", {
    timeZone: "America/Edmonton",
    month: "short",
    day: "numeric",
  });
  return prefix ? `${prefix} ${date}` : date;
}
