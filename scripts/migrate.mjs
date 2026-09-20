/**
 * Applies pending migrations before a build.
 *
 * Set SKIP_MIGRATE=true when the database is deliberately unreachable from the
 * machine doing the build (for example when building the Cloudflare Worker
 * from a sandbox). Anything else is a real failure and stops the build, so a
 * deploy can never ship code that expects a column the database lacks.
 */
import { spawnSync } from "node:child_process";

if (process.env.SKIP_MIGRATE === "true") {
  console.log("[migrate] SKIP_MIGRATE=true — not touching the database.");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
process.exit(result.status ?? 1);
