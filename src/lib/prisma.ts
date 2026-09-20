import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The app runs on Cloudflare Workers, which has no raw TCP for node-postgres,
 * so Prisma talks to Neon through its serverless driver (WebSocket) instead.
 * The WebSocket pool — rather than the HTTP one — because Prisma needs real
 * transactions for nested writes.
 *
 * The same driver works under Node, so local development, the build and the
 * Worker all take exactly one code path. DATABASE_URL must therefore point at
 * a Neon database (a free Neon branch is the usual choice for development).
 */

const connectionString = process.env.DATABASE_URL;

function createClient() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and point it at your Neon database.",
    );
  }
  // Constructing the pool performs no I/O, so this is safe at module scope
  // inside a Worker isolate.
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
