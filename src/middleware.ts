import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "rootsym_admin";
const USER_COOKIE = "rootsym_user";

/**
 * Verifies a session cookie and insists on the role it should carry.
 *
 * The role check is the whole point: admin and customer tokens are signed
 * with the same secret, so without it either would open the other's doors.
 */
async function hasRole(request: NextRequest, cookie: string, role: string): Promise<boolean> {
  const token = request.cookies.get(cookie)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "rootsym",
    });
    return payload.role === role;
  } catch {
    return false;
  }
}

/** Sends a visitor to sign in, remembering where they were headed. */
function toSignIn(request: NextRequest): NextResponse {
  const url = new URL("/signin", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- admin ---------------------------------------------------------------
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isLogin = pathname === "/admin/login";
    const isLoginApi = pathname === "/api/admin/login";

    if (isLogin || isLoginApi) {
      if (isLogin && (await hasRole(request, ADMIN_COOKIE, "admin"))) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (await hasRole(request, ADMIN_COOKIE, "admin")) return NextResponse.next();

    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authorised." }, { status: 401 });
    }

    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // --- customers -----------------------------------------------------------
  // Booking needs an account, so every seat belongs to someone we can reach
  // again. The token-addressed pages stay open on purpose: they are reached
  // from a link in an email, often on a different device from the one that
  // booked, and the token is itself the proof.
  if (pathname.startsWith("/checkout/confirm/") || pathname === "/checkout/success") {
    return NextResponse.next();
  }

  if (await hasRole(request, USER_COOKIE, "customer")) return NextResponse.next();

  if (pathname === "/api/checkout") {
    return NextResponse.json(
      { error: "Please sign in to reserve a seat.", signIn: "/signin" },
      { status: 401 },
    );
  }

  return toSignIn(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/api/checkout",
  ],
};
