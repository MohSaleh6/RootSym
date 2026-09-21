/**
 * Applies pending migrations before a build.
 *
 * Migrations run against the direct (non-pooled) database host — see
 * scripts/db-url.mjs for why. If that host cannot be reached we fall back to
 * whatever DATABASE_URL points at, so a database with only one host still
 * works.
 *
 * Set SKIP_MIGRATE=true when the database is deliberately unreachable from the
 * machine doing the build. Anything else is a real failure and stops the
 * build, so a deploy can never ship code that expects a column the database
 * lacks.
 */
import { spawnSync } from "node:child_process";
import { forMigrations, migrationUrl, redact } from "./db-url.mjs";

// `npm run db:migrate` passes --force: the operator asked for migrations by
// name, so an ambient SKIP_MIGRATE from a build profile must not silence them.
const force = process.argv.includes("--force");

if (!force && process.env.SKIP_MIGRATE === "true") {
  console.log("[migrate] SKIP_MIGRATE=true — not touching the database.");
  process.exit(0);
}

if (!process.env.DATABASE_URL && !process.env.DIRECT_DATABASE_URL) {
  console.error(
    "[migrate] DATABASE_URL is not set.\n" +
      "[migrate] Set it for this build, or set SKIP_MIGRATE=true and run\n" +
      "[migrate] `npm run db:migrate` from somewhere that can reach the database.",
  );
  process.exit(1);
}

function deploy(url, label) {
  console.log(`[migrate] prisma migrate deploy against the ${label} host: ${redact(url)}`);
  return spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}

const direct = migrationUrl();
let result = deploy(direct, "direct");

const pooled = forMigrations(process.env.DATABASE_URL);
if (result.status !== 0 && pooled && direct !== pooled) {
  console.warn("[migrate] The direct host did not work — retrying through the pooler.");
  result = deploy(pooled, "pooled");
}

if (result.status !== 0) {
  console.error(
    "[migrate] Migrations failed. The build stops here so it cannot ship code\n" +
      "[migrate] that expects a schema the database does not have.\n" +
      "[migrate] Check the error above; if the database is simply unreachable from\n" +
      "[migrate] this builder, set SKIP_MIGRATE=true and migrate separately.",
  );
}

process.exit(result.status ?? 1);
