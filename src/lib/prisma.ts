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

type Client = PrismaClient;

function createClient(): Client {
  const connectionString = process.env.DATABASE_URL;
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

const globalForPrisma = globalThis as unknown as { prisma?: Client };

function client(): Client {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;
  const created = createClient();
  // One client per isolate in production too: a Worker isolate serves many
  // requests, and a fresh pool per request would be wasted connections.
  globalForPrisma.prisma = created;
  return created;
}

/**
 * Built on first use rather than at import.
 *
 * The difference matters when DATABASE_URL is missing: constructing eagerly
 * would throw while the module is being imported, which Next cannot attribute
 * to anything and which no page can catch — including the readiness page
 * whose whole job is to say that the variable is missing. Deferred, the same
 * misconfiguration surfaces as an ordinary rejected query.
 */
export const prisma: Client = new Proxy({} as Client, {
  get(_target, property) {
    // The real client is the receiver too, so Prisma's own getters see the
    // `this` they expect rather than this proxy.
    const real = client();
    const value = Reflect.get(real, property, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
