import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation";
import { createUserSession, hashPassword, normaliseEmail } from "@/lib/user-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const input = parsed.data;
  const email = normaliseEmail(input.email);

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // An account created through Google has no password yet. Rather than
      // refuse someone who is plainly the owner of the address, tell them the
      // door they already have — we cannot prove ownership here, so we must
      // not simply attach a password to it.
      if (!existing.passwordHash) {
        return NextResponse.json(
          { error: "This email already signs in with Google. Use the Google button instead." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists. Sign in instead." },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: input.name,
        phone: input.phone || null,
        organisation: input.organisation || null,
        jobTitle: input.jobTitle || null,
        passwordHash: await hashPassword(input.password),
        lastSignInAt: new Date(),
      },
    });

    await createUserSession(user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[signup] failed", error);
    return NextResponse.json(
      { error: "We could not create your account just now. Please try again in a moment." },
      { status: 503 },
    );
  }
}
