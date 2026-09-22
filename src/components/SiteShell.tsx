import type { ReactNode } from "react";
import { getUserSession } from "@/lib/user-auth";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/**
 * A server component on purpose: it reads the session here, so the header
 * renders signed-in or signed-out on the very first paint. Fetching it from
 * the client instead would flash "Sign in" at people who are already in.
 */
export default async function SiteShell({
  children,
  overDark = true,
}: {
  children: ReactNode;
  /** true when the page opens with a dark hero band behind the header */
  overDark?: boolean;
}) {
  const session = await getUserSession();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader overDark={overDark} signedIn={Boolean(session)} name={session?.name ?? null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
