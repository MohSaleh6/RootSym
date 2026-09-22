import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { STATE_COOKIE, exchangeCodeForProfile, googleEnabled } from "@/lib/google-oauth";
import { createUserSession } from "@/lib/user-auth";
import { siteUrl } from "@/lib/enrollment";

export const runtime = "nodejs";

/** Only ever send people to a path on this site, never to a URL they supplied. */
function safeNext(raw: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw;
}

export async function GET(request: Request) {
  const base = await siteUrl();
  const fail = (reason: string) => NextResponse.redirect(`${base}/signin?error=${reason}`);

  if (!googleEnabled()) return fail("google-unavailable");

  const params = new URL(request.url).searchParams;
  if (params.get("error")) return fail("google-cancelled");

  const code = params.get("code");
  const state = params.get("state") ?? "";
  const [nonce, rawNext = ""] = state.split(".");

  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;
  store.delete(STATE_COOKIE);

  // No state match means this reply did not start from our button.
  if (!code || !nonce || !expected || nonce !== expected) return fail("google-state");

  try {
    const profile = await exchangeCodeForProfile(code);

    // An unverified Google address proves nothing about who owns it, and we
    // key accounts on the address.
    if (!profile.emailVerified) return fail("google-unverified");

    // Match on the Google subject first — it survives a changed address —
    // then fall back to the email so an existing password account is joined
    // rather than duplicated.
    const existing =
      (await prisma.user.findUnique({ where: { googleId: profile.sub } })) ??
      (await prisma.user.findUnique({ where: { email: profile.email } }));

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            googleId: profile.sub,
            avatarUrl: existing.avatarUrl ?? profile.picture,
            lastSignInAt: new Date(),
          },
        })
      : await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            googleId: profile.sub,
            avatarUrl: profile.picture,
            lastSignInAt: new Date(),
          },
        });

    await createUserSession(user);
    return NextResponse.redirect(`${base}${safeNext(decodeURIComponent(rawNext))}`);
  } catch (error) {
    console.error("[google] sign-in failed", error);
    return fail("google-failed");
  }
}
