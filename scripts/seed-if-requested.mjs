/**
 * Runs the seed during a deploy only when SEED_ON_BUILD is set.
 *
 * Used once, on the very first deploy of a new database. The seed itself is
 * idempotent (every write is an upsert that does not overwrite existing rows),
 * but the flag keeps it off the critical path of every later build.
 */
import { spawnSync } from "node:child_process";

if (process.env.SEED_ON_BUILD !== "true") {
  console.log("[seed] SEED_ON_BUILD is not set — skipping.");
  process.exit(0);
}

console.log("[seed] SEED_ON_BUILD=true — seeding the database.");
const result = spawnSync("npx", ["tsx", "prisma/seed.ts"], { stdio: "inherit" });

// A failed seed must not take the deployment down; the schema is already live
// and the admin panel can create everything by hand.
if (result.status !== 0) {
  console.error("[seed] seeding failed — continuing with the build anyway.");
}
