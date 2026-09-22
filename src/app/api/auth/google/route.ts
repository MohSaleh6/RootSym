import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STATE_COOKIE, googleAuthUrl, googleEnabled } from "@/lib/google-oauth";
import { siteUrl } from "@/lib/enrollment";

export const runtime = "nodejs";

/** Starts the Google flow. The state cookie is what proves the reply is ours. */
export async function GET(request: Request) {
  const base = await siteUrl();

  if (!googleEnabled()) {
    return NextResponse.redirect(`${base}/signin?error=google-unavailable`);
  }

  const next = new URL(request.url).searchParams.get("next") ?? "";
  const nonce = crypto.randomUUID();
  // The state carries the nonce and where to land afterwards. Only the nonce
  // is compared; the path is sanitised on the way back.
  const state = `${nonce}.${encodeURIComponent(next)}`;

  const store = await cookies();
  store.set(STATE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(await googleAuthUrl(state));
}
