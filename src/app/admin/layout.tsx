import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/auth";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · RootSym Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  // The login screen renders without the shell; middleware guards the rest.
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-cream">
      <AdminNav email={session.email} />
      <div className="lg:ps-60">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
