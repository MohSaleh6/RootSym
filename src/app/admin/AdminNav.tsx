"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  Users,
  MessageSquare,
  Settings,
  Stethoscope,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Workshops", icon: GraduationCap },
  { href: "/admin/sessions", label: "Live dates", icon: CalendarDays },
  { href: "/admin/enrollments", label: "Bookings", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/health", label: "Readiness", icon: Stethoscope },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const nav = (
    <>
      <Link href="/admin" className="flex items-center gap-3 px-5 py-6">
        <LogoMark className="h-9 w-9" tone="light" animated={false} />
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold text-cream">RootSym</span>
          <span className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.28em] text-brass">
            Admin
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map((l) => {
          const on = active(l.href, l.exact);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.86rem] font-medium transition-all duration-300 ${
                on
                  ? "bg-gold/15 text-brass"
                  : "text-sky/65 hover:bg-white/[0.04] hover:text-cream"
              }`}
            >
              <l.icon
                className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                  on ? "text-gold" : ""
                }`}
                strokeWidth={1.7}
              />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-sky/10 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.82rem] text-sky/60 transition-colors hover:bg-white/[0.04] hover:text-cream"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.7} />
          View site
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.82rem] text-sky/60 transition-colors hover:bg-ember/10 hover:text-flame"
        >
          <LogOut className="h-4 w-4 flip-x" strokeWidth={1.7} />
          Sign out
        </button>
        <p className="truncate px-3.5 pt-2 text-[0.68rem] text-sky/35" dir="ltr">
          {email}
        </p>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-60 flex-col border-e border-sky/10 bg-ink lg:flex">
        <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex h-full flex-col">{nav}</div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-sky/10 bg-ink px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" tone="light" animated={false} />
          <span className="font-display text-lg font-bold text-cream">RootSym</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky/20 text-cream"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 start-0 flex w-64 flex-col bg-ink pt-16">{nav}</aside>
        </div>
      )}
    </>
  );
}
