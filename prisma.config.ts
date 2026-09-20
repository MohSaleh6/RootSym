import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // A plain read (rather than Prisma's env() helper) so that `prisma generate`
    // still runs during install when no database URL is present yet.
    url: process.env.DATABASE_URL ?? "",
  },
});
