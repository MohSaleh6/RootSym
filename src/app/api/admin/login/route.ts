import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { createAdminSession, safeEqual } from "@/lib/auth";

export const runtime = "nodejs";

/** Small in-memory throttle; enough to blunt a casual brute force. */
const attempts = new Map<string, { count: number; until: number }>();

function throttled(key: string): boolean {
  const row = attempts.get(key);
  if (!row) return false;
  if (Date.now() > row.until) {
    attempts.delete(key);
    return false;
  }
  return row.count >= 8;
}

function recordFailure(key: string) {
  const row = attempts.get(key) ?? { count: 0, until: Date.now() + 10 * 60_000 };
  row.count += 1;
  row.until = Date.now() + 10 * 60_000;
  attempts.set(key, row);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (throttled(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const plain = process.env.ADMIN_PASSWORD;
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedEmail || (!plain && !hash)) {
    return NextResponse.json(
      { error: "Admin access is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD." },
      { status: 500 },
    );
  }

  const emailOk = safeEqual(email, expectedEmail);
  const passwordOk = hash ? await compare(password, hash) : safeEqual(password, plain!);

  if (!emailOk || !passwordOk) {
    recordFailure(ip);
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  attempts.delete(ip);
  await createAdminSession(email);
  return NextResponse.json({ ok: true });
}
