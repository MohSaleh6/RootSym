import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-friendly booking reference, e.g. RS-7K4M-2QX9 */
export function makeReference(): string {
  const block = (n: number) =>
    Array.from(randomBytes(n))
      .map((b) => ALPHABET[b % ALPHABET.length])
      .join("");
  return `RS-${block(4)}-${block(4)}`;
}

/** Unguessable single-use access token for the live-session link. */
export function makeAccessToken(): string {
  return randomBytes(24).toString("base64url");
}
