import type { DateKey } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Local-time YYYY-MM-DD for a Date (toISOString would use UTC and shift days). */
export function toDateKey(d: Date = new Date()): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Calendar arithmetic on date keys; safe across DST changes. */
export function addDays(key: DateKey, n: number): DateKey {
  const d = parseDateKey(key);
  return toDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

export function isDateKey(value: unknown): value is DateKey {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function formatDateKey(key: DateKey, opts: Intl.DateTimeFormatOptions): string {
  try {
    return parseDateKey(key).toLocaleDateString(undefined, opts);
  } catch {
    return key;
  }
}
