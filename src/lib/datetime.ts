import type { Locale } from "@/i18n/dictionary";

/**
 * Dates rendered inside client components must match byte for byte between the
 * Node render and the browser render. Different ICU builds disagree about the
 * literal separators inside a combined pattern (en-GB "Sunday 11 October" vs
 * "Sunday, 11 October"), so every field is formatted on its own and joined by
 * us. Formatting always happens in the session's own timezone.
 */

function localeTag(locale: Locale): string {
  return locale === "ar" ? "ar-JO" : "en-GB";
}

function part(
  date: Date,
  locale: Locale,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(localeTag(locale), { ...options, timeZone }).format(date);
}

export function formatLongDate(iso: string | Date, timeZone = "Asia/Amman", locale: Locale = "en"): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const weekday = part(date, locale, timeZone, { weekday: "long" });
  const day = part(date, locale, timeZone, { day: "numeric" });
  const month = part(date, locale, timeZone, { month: "long" });
  const year = part(date, locale, timeZone, { year: "numeric" });
  return `${weekday} ${day} ${month} ${year}`;
}

export function formatShortDate(iso: string | Date, timeZone = "Asia/Amman", locale: Locale = "en"): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const day = part(date, locale, timeZone, { day: "numeric" });
  const month = part(date, locale, timeZone, { month: "short" });
  const year = part(date, locale, timeZone, { year: "numeric" });
  return `${day} ${month} ${year}`;
}

export function formatTime(iso: string | Date, timeZone = "Asia/Amman", locale: Locale = "en"): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return part(date, locale, timeZone, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export function formatDateTime(iso: string | Date, timeZone = "Asia/Amman", locale: Locale = "en"): string {
  return `${formatLongDate(iso, timeZone, locale)} · ${formatTime(iso, timeZone, locale)}`;
}

/**
 * RootSym runs on Amman time. Anything shown to Rand or typed by her is
 * wall-clock time here, whatever timezone the server or her phone is in.
 */
export const BUSINESS_TZ = "Asia/Amman";

/** How far `timeZone` is ahead of UTC at `instant`, in minutes (Amman: +180). */
function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wallClockAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return Math.round((wallClockAsUtc - instant.getTime()) / 60_000);
}

/**
 * A datetime-local value ("2026-10-11T09:00") read as wall-clock time in
 * `timeZone`, returned as the real instant.
 *
 * `new Date("2026-10-11T09:00")` would read it in whatever zone the code
 * happens to run in — the browser's, or UTC on the server — which is how a
 * session meant for 09:00 in Amman ends up stored as 09:00 UTC and shown to
 * customers as 12:00.
 */
export function zonedLocalToUtc(local: string, timeZone = BUSINESS_TZ): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local);
  if (!match) return new Date(Number.NaN);
  const [, year, month, day, hour, minute] = match.map(Number);
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  // The second pass matters only when the first guess lands on the other side
  // of a daylight-saving change from the answer.
  let guess = naive - zoneOffsetMinutes(new Date(naive), timeZone) * 60_000;
  guess = naive - zoneOffsetMinutes(new Date(guess), timeZone) * 60_000;
  return new Date(guess);
}

/** What a datetime-local input needs in order to show `instant` as wall-clock time in `timeZone`. */
export function toZonedInputValue(instant: string | Date, timeZone = BUSINESS_TZ): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  const shifted = new Date(date.getTime() + zoneOffsetMinutes(date, timeZone) * 60_000);
  return shifted.toISOString().slice(0, 16);
}

/** "11 Oct 2026, 09:00" in the business timezone — the admin panel's format. */
export function formatAdminDateTime(iso: string | Date, timeZone = BUSINESS_TZ): string {
  return `${formatShortDate(iso, timeZone)}, ${formatTime(iso, timeZone)}`;
}
