import { useSessionStore } from '../stores/sessionStore';

/**
 * Get the restaurant's timezone from session store.
 * Falls back to 'America/Los_Angeles'.
 */
export function getTimezone(): string {
  return useSessionStore.getState().timezone || 'America/Los_Angeles';
}

/**
 * Get "today" as YYYY-MM-DD in the restaurant's timezone.
 */
export function todayStr(tz?: string): string {
  const timezone = tz ?? getTimezone();
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
}

/**
 * Get a date N days ago as YYYY-MM-DD in the restaurant's timezone.
 */
export function daysAgoStr(days: number, tz?: string): string {
  const timezone = tz ?? getTimezone();
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString('en-CA', { timeZone: timezone });
}

/**
 * Format a YYYY-MM-DD date string for display (e.g., "Mon, Mar 18").
 * Uses the restaurant's timezone context.
 */
export function formatDateDisplay(dateStr: string, options?: Intl.DateTimeFormatOptions, tz?: string): string {
  const timezone = tz ?? getTimezone();
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { timeZone: timezone, ...options });
}

/**
 * Format an ISO timestamp for display in the restaurant's timezone.
 */
export function formatTimestamp(iso: string, options?: Intl.DateTimeFormatOptions, tz?: string): string {
  const timezone = tz ?? getTimezone();
  const d = new Date(iso);
  const defaults: Intl.DateTimeFormatOptions = {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    hour12: true,
  };
  return d.toLocaleString('en-US', { timeZone: timezone, ...defaults, ...options });
}

/**
 * Get the current time formatted in the restaurant's timezone.
 */
export function nowTimeStr(options?: Intl.DateTimeFormatOptions, tz?: string): string {
  const timezone = tz ?? getTimezone();
  const defaults: Intl.DateTimeFormatOptions = {
    hour: 'numeric', minute: '2-digit', second: '2-digit',
    hour12: true,
  };
  return new Date().toLocaleTimeString('en-US', { timeZone: timezone, ...defaults, ...options });
}

/**
 * Get today's date formatted for display in the restaurant's timezone.
 */
export function todayDisplay(options?: Intl.DateTimeFormatOptions, tz?: string): string {
  const timezone = tz ?? getTimezone();
  const defaults: Intl.DateTimeFormatOptions = {
    weekday: 'long', month: 'short', day: 'numeric',
  };
  return new Date().toLocaleDateString('en-US', { timeZone: timezone, ...defaults, ...options });
}

/**
 * Get the day of week index (0=Sun, 6=Sat) for a YYYY-MM-DD string.
 */
export function getDayOfWeek(dateStr: string, tz?: string): number {
  const timezone = tz ?? getTimezone();
  const d = new Date(dateStr + 'T12:00:00');
  const dayStr = d.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short' });
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayStr] ?? 0;
}
