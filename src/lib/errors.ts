/**
 * Turning a thrown thing into a sentence.
 *
 * Not every rejection is an Error. Neon's WebSocket driver rejects with an
 * ErrorEvent, whose String() is the useless "[object ErrorEvent]", and Prisma
 * wraps causes several layers deep. Unwrap the shapes that actually turn up
 * before giving up, and never let a connection string's password through.
 */
export function describeError(error: unknown): string {
  const seen = new Set<unknown>();

  function unwrap(value: unknown, depth = 0): string | null {
    if (value == null || depth > 4 || seen.has(value)) return null;
    if (typeof value === "string") return value.trim() || null;
    if (typeof value !== "object") return String(value);
    seen.add(value);

    const record = value as Record<string, unknown>;
    for (const key of ["message", "error", "cause", "reason"]) {
      const nested = unwrap(record[key], depth + 1);
      if (nested) return nested;
    }
    // An ErrorEvent that carries nothing but its type still names the failure.
    return typeof record.type === "string" ? `Connection ${record.type}` : null;
  }

  const raw = unwrap(error) ?? "No message was attached to the error.";
  return raw.replace(/\/\/[^@\s]*@/g, "//***@").slice(0, 400);
}
