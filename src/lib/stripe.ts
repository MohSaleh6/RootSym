import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) {
    cached = new Stripe(key, { typescript: true });
  }
  return cached;
}

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Stripe cannot charge in JOD on every account. STRIPE_CURRENCY lets you
 * settle in a supported currency while the storefront still quotes JOD.
 * STRIPE_RATE_PER_JOD is how many units of that currency one JOD is worth.
 */
export function stripeCurrency(): string {
  return (process.env.STRIPE_CURRENCY || "jod").toLowerCase();
}

const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);
const THREE_DECIMAL = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

/** Convert our fils amount into Stripe's minor unit for the settlement currency. */
export function toStripeAmount(fils: number): number {
  const currency = stripeCurrency();
  if (currency === "jod") return fils; // fils IS the JOD minor unit
  const rate = Number(process.env.STRIPE_RATE_PER_JOD || "1.41"); // JOD -> USD default
  const major = (fils / 1000) * rate;
  if (ZERO_DECIMAL.has(currency)) return Math.round(major);
  if (THREE_DECIMAL.has(currency)) return Math.round(major * 1000);
  return Math.round(major * 100);
}
