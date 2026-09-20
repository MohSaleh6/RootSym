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
