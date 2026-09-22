import "server-only";
import { siteUrl } from "./enrollment";

/**
 * Sign in with Google, by hand.
 *
 * The whole exchange is four HTTPS calls and a signed state cookie, so a
 * framework would only add weight to a Worker bundle that has a size limit.
 * Nothing here runs unless both credentials are set, which is what lets the
 * Google button appear only once it can actually work.
 */

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export const STATE_COOKIE = "rootsym_oauth_state";

export function googleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * The redirect URI is derived from the request host, so the same deployment
 * works on workers.dev and on a custom domain without a rebuild. Whatever it
 * returns must be listed verbatim in the Google credential.
 */
export async function googleRedirectUri(): Promise<string> {
  return `${await siteUrl()}/api/auth/google/callback`;
}

export async function googleAuthUrl(state: string): Promise<string> {
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", await googleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  // Ask for an account every time: people share devices, and silently
  // reusing whichever Google session happens to be open is how someone
  // books a seat under a colleague's name.
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
};

export async function exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: await googleRedirectUri(),
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenRes.ok) {
    throw new Error(`Google refused the code exchange (${tokenRes.status}).`);
  }
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Google returned no access token.");

  const infoRes = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!infoRes.ok) throw new Error(`Google refused the profile request (${infoRes.status}).`);

  const info = (await infoRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    picture?: string;
  };

  if (!info.sub || !info.email) throw new Error("Google returned an incomplete profile.");

  return {
    sub: info.sub,
    email: info.email.toLowerCase(),
    emailVerified: info.email_verified !== false,
    name: info.name || info.given_name || info.email.split("@")[0],
    picture: info.picture ?? null,
  };
}
