import { PrismaNeon } from "@prisma/adapter-neon";
import { getCloudflareContext } from "@opennextjs/cloudflare";
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

/** How long to wait before each retry. Neon wakes a suspended compute in about a second. */
const RETRY_DELAYS_MS = [250, 750, 1750];

/**
 * Whether an error means the query never reached Postgres.
 *
 * On Neon's free plan the compute suspends after a few minutes of quiet, and
 * the first request afterwards arrives while it is still waking up. That
 * surfaces as a failure to open the connection — never as a result — so
 * retrying is safe: there is no half-applied write to worry about. Anything
 * Postgres actually answered (a unique-constraint violation, a missing row)
 * carries a P2xxx code and must not be retried, because the answer will not
 * change and retrying would hide a real bug.
 */
function isConnectionFailure(error: unknown): boolean {
  const code = (error as { code?: unknown })?.code;

  if (typeof code === "string") {
    // P1001 unreachable · P1002 timed out · P1017 closed the connection.
    if (code === "P1001" || code === "P1002" || code === "P1017") return true;
    // Anything else Postgres named is an answer, not a failure to ask.
    return false;
  }

  // The Neon driver rejects with an ErrorEvent that carries no Prisma code
  // when the socket cannot be opened at all. A malformed query has no code
  // either, but repeating it would only waste the visitor's time.
  const name = (error as { name?: unknown })?.name;
  if (typeof name === "string" && name.startsWith("PrismaClientValidation")) return false;
  return name !== "PrismaClientKnownRequestError";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  let firstError: unknown;
  let attempted = false;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      // Whatever went wrong the first time is the truth. A later attempt can
      // fail differently — re-running a query Prisma has already settled is
      // our doing, not the database's — and reporting that instead would send
      // whoever reads the log chasing our retry rather than their bug.
      if (!attempted) {
        firstError = error;
        attempted = true;
      }
      if (!isConnectionFailure(error) || attempt === RETRY_DELAYS_MS.length) throw firstError;
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw firstError;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and point it at your Neon database.",
    );
  }
  // Constructing the pool performs no I/O, so this is safe at module scope
  // inside a Worker isolate.
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter }).$extends({
    query: {
      $allOperations: ({ args, query }) => withRetry(() => query(args)),
    },
  });
}

type Client = ReturnType<typeof createClient>;

/**
 * One client per request on Workers, one per process everywhere else.
 *
 * The Neon pool holds open WebSockets, and a Worker may not touch an I/O
 * object created while serving a different request: the runtime rejects it
 * with "Cannot perform I/O on behalf of a different request" as an uncaught
 * error, which escapes every try/catch and error boundary and surfaces as
 * Cloudflare's Error 1101. Keeping a single client for the life of the
 * isolate — which is what this file used to do — therefore worked for the
 * first request after a deploy and failed for some later one.
 *
 * OpenNext runs every request inside its own context carrying that request's
 * ExecutionContext, so the client is keyed on it and is dropped along with
 * it. Under Node (next dev, next build) there is no such context and sockets
 * are not request-bound, so a process-wide client is both allowed and
 * cheaper.
 */
const perRequest = new WeakMap<object, Client>();
const globalForPrisma = globalThis as unknown as { prisma?: Client };

function requestScope(): object | null {
  try {
    return getCloudflareContext().ctx ?? null;
  } catch {
    return null;
  }
}

function client(): Client {
  const scope = requestScope();

  if (scope) {
    let scoped = perRequest.get(scope);
    if (!scoped) {
      scoped = createClient();
      perRequest.set(scope, scoped);
    }
    return scoped;
  }

  globalForPrisma.prisma ??= createClient();
  return globalForPrisma.prisma;
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
