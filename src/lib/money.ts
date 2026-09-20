/**
 * All money in RootSym is stored as an integer number of fils.
 * 1 JOD = 1000 fils. Stripe's minor unit for JOD is also the fils,
 * so the stored value can be handed to Stripe untouched.
 */
export const FILS_PER_JOD = 1000;

export function filsToJod(fils: number): number {
  return fils / FILS_PER_JOD;
}

export function jodToFils(jod: number): number {
  return Math.round(jod * FILS_PER_JOD);
}

/** "85" -> 85000 ; "85.5" -> 85500 ; "1,200.00" -> 1200000 */
export function parseJodInput(value: string | number): number {
  const raw = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return jodToFils(raw);
}

export function formatJod(fils: number, locale: "en" | "ar" = "en"): string {
  const amount = filsToJod(fils);
  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return locale === "ar" ? `${formatted} د.أ` : `${formatted} JOD`;
}

/** Price per head when a company books the full room. */
export function perSeat(fils: number, seats: number): number {
  if (seats <= 0) return fils;
  return Math.round(fils / seats);
}
