export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";

  return new Intl.NumberFormat("en-US").format(n);
}

/**
 * Backend timestamps are stored in UTC.
 * If the backend sends a timestamp without Z or timezone offset,
 * explicitly treat it as UTC.
 */
function parseBackendDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;

  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(iso);

  const normalizedIso = hasTimezone ? iso : `${iso}Z`;

  const date = new Date(normalizedIso);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatRelative(
  iso: string | null | undefined
): string {
  const date = parseBackendDate(iso);

  if (!date) return "Never";

  const diff = Date.now() - date.getTime();

  // Protect against small clock differences
  if (diff < 0) {
    return "just now";
  }

  const sec = Math.floor(diff / 1000);

  if (sec < 45) {
    return "just now";
  }

  const min = Math.floor(sec / 60);

  if (min < 60) {
    return `${min}m ago`;
  }

  const hr = Math.floor(min / 60);

  if (hr < 24) {
    return `${hr}h ago`;
  }

  const day = Math.floor(hr / 24);

  if (day < 7) {
    return `${day}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(
  iso: string | null | undefined
): string {
  const date = parseBackendDate(iso);

  if (!date) return "—";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}