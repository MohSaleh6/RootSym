import "server-only";
import { NextResponse } from "next/server";
import { describeError } from "./errors";

/**
 * The reply for something that went wrong in a way the code did not foresee.
 *
 * Admin routes are behind a session, so the only person who ever sees this is
 * the one who can act on it — which makes hiding the reason pure loss. A
 * generic "that action failed" costs an afternoon of guessing; the actual
 * sentence usually costs nothing.
 */
export function unexpected(scope: string, error: unknown): NextResponse {
  console.error(`[${scope}]`, error);
  return NextResponse.json({ error: `${scope}: ${describeError(error)}` }, { status: 500 });
}
