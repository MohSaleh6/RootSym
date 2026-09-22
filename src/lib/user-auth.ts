import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Customer sessions.
 *
 * Deliberately separate from the admin session in src/lib/auth.ts: a
 * different cookie, a different role claim and a much longer life. The two
 * can never be mistaken for each other, because each verifier insists on its
 * own role — an admin token presented as a customer is rejected, and the
 * reverse, which is the part that matters.
 */

const COOKIE = "rootsym_user";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days — a booking is not a bank.
const ROLE = "customer";

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 24 characters.");
  }
  return new TextEncoder().encode(value);
}

export type CustomerSession = { id: string; email: string; name: string };

export async function createUserSession(user: {
  id: string;
  email: string;
  name: string;
}): Promise<void> {
  const token = await new SignJWT({ role: ROLE, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setIssuer("rootsym")
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroyUserSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** The signed-in customer according to the cookie alone — no database read. */
export async function getUserSession(): Promise<CustomerSession | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret(), { issuer: "rootsym" });
    if (payload.role !== ROLE || typeof payload.sub !== "string") return null;
    return {
      id: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
    };
  } catch {
    return null;
  }
}

/**
 * The signed-in customer as the database has them.
 *
 * Returns null when the cookie is valid but the account is gone, so a deleted
 * account cannot keep acting on a token that has not expired yet.
 */
export async function getCurrentUser() {
  const session = await getUserSession();
  if (!session) return null;
  try {
    return await prisma.user.findUnique({ where: { id: session.id } });
  } catch {
    return null;
  }
}

const ROUNDS = 10; // Workers have a CPU budget; 10 is the usual web default.

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Emails are compared lowercase everywhere, so normalise at every entrance. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
