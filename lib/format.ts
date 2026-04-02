const DEFAULT_LOCALE = "en-US";

export function relativeTime(value: string | null): string {
  if (!value) return "UNKNOWN";
  const then = new Date(value).getTime();
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "JUST NOW";
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "YESTERDAY" : `${days}D AGO`;
}

export function formatCurrency(value: number | null, currency: string | null): string {
  if (value === null) return "UNKNOWN";
  return `${currency ?? ""} ${value.toLocaleString(DEFAULT_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`.trim();
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(DEFAULT_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

export function formatClock(value: string | null): string {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString(DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function confidenceBadge(value: string): string {
  if (value === "high") return "[HIGH *]";
  if (value === "medium") return "[MED -]";
  return "[LOW .]";
}

export function categoryBadge(value: string): string {
  return `[${value.replace(/_/g, " ").toUpperCase()}]`;
}

export function statusStamp(status: string): string {
  if (status === "completed") return "[MONITORED *]";
  if (status === "pending") return "[SCANNING >>>]_";
  if (status === "blocked") return "[BLOCKED *]";
  return "[FAILED !]";
}

export function severityBadge(value: string): string {
  if (value === "high") return "[HIGH]";
  if (value === "medium") return "[MED]";
  return "[LOW]";
}

export function uppercaseOrFallback(value: string | null | undefined, fallback: string): string {
  return (value || fallback).toUpperCase();
}
