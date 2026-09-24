import bcrypt from "bcryptjs";

/**
 * Password hashing that fits inside a Worker.
 *
 * Workers on the free plan get 10 ms of CPU per request. bcryptjs is bcrypt
 * written in plain JavaScript, and at the usual cost of 10 it spends about
 * 78 ms — every sign-up and sign-in would end in Error 1102. PBKDF2 through
 * WebCrypto runs natively in the runtime and does comparable work in a
 * fraction of the time.
 *
 * 100,000 iterations is the most the Workers runtime accepts. Each stored hash
 * records its own count, so raising it later needs no migration: old hashes
 * keep verifying at the count they were made with.
 *
 * Stored as: pbkdf2-sha256$<iterations>$<salt b64>$<hash b64>
 */

const SCHEME = "pbkdf2-sha256";
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    HASH_BITS,
  );
  return new Uint8Array(bits);
}

/** Compares in time that does not depend on where the first difference is. */
function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `${SCHEME}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // A bcrypt hash from before this scheme, or one pasted into
  // ADMIN_PASSWORD_HASH by hand. Slow on a Worker, but still correct.
  if (stored.startsWith("$2")) return bcrypt.compare(password, stored);

  const [scheme, rawIterations, rawSalt, rawHash] = stored.split("$");
  const iterations = Number(rawIterations);
  if (scheme !== SCHEME || !Number.isInteger(iterations) || !rawSalt || !rawHash) return false;

  try {
    const expected = fromBase64(rawHash);
    const actual = await derive(password, fromBase64(rawSalt), iterations);
    return sameBytes(actual, expected);
  } catch {
    // Malformed base64 or an iteration count the runtime refuses.
    return false;
  }
}
