/**
 * Connection strings for schema work.
 *
 * Neon hands out two hosts for the same database. The pooled one
 * (`…-pooler.…`) sits behind PgBouncer in transaction mode, which is what the
 * app wants: a Worker isolate opens a connection per request and PgBouncer
 * keeps Postgres from drowning in them. Migrations want the opposite — a
 * single session that can hold an advisory lock and run DDL in one
 * transaction — so Prisma needs the direct host instead.
 *
 * Rather than ask for a second environment variable everywhere, derive the
 * direct host from the pooled one. `DIRECT_DATABASE_URL` overrides the
 * derivation for databases that name their hosts differently.
 */

/**
 * @param {string | undefined} url
 * @returns {string | undefined} the same URL against the non-pooled host, or
 *   `url` unchanged when it is not a Neon pooled URL.
 */
export function toDirectUrl(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("-pooler.")) return url;
    parsed.hostname = parsed.hostname.replace("-pooler.", ".");
    return parsed.toString();
  } catch {
    // Not a URL we can parse — hand it back and let Prisma report the problem.
    return url;
  }
}

/**
 * Prisma's migration engine is a Rust binary with its own TLS stack, and it
 * rejects connection strings carrying `channel_binding` — a parameter Neon
 * puts in every string it hands out. Drop it; `sslmode` still applies.
 *
 * @param {string | undefined} url
 */
export function dropChannelBinding(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Makes a connection string safe for `prisma migrate`. */
export function forMigrations(url) {
  return dropChannelBinding(toDirectUrl(url));
}

/** The URL migrations should run against. */
export function migrationUrl() {
  const explicit = process.env.DIRECT_DATABASE_URL;
  if (explicit) return dropChannelBinding(explicit);
  return forMigrations(process.env.DATABASE_URL);
}

/** Hides the password so a URL can go in a build log. */
export function redact(url) {
  if (!url) return String(url);
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "<unparseable connection string>";
  }
}
