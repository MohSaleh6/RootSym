"use client";

import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SiteShell({
  children,
  overDark = true,
}: {
  children: ReactNode;
  /** true when the page opens with a dark hero band behind the header */
  overDark?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader overDark={overDark} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
