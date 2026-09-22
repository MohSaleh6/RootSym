import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validation";
import { createUserSession, normaliseEmail, verifyPassword } from "@/lib/user-auth";

export const runtime = "nodejs";

/** One message for both "no such account" and "wrong password". */
const REJECTED = "That email and password do not match an account.";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = signInSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: REJECTED }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normaliseEmail(parsed.data.email) },
    });

    if (!user) return NextResponse.json({ error: REJECTED }, { status: 401 });

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account signs in with Google. Use the Google button." },
        { status: 401 },
      );
    }

    if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: REJECTED }, { status: 401 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastSignInAt: new Date() } });
    await createUserSession(user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[signin] failed", error);
    return NextResponse.json(
      { error: "We could not sign you in just now. Please try again in a moment." },
      { status: 503 },
    );
  }
}
