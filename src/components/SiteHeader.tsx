"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import LanguageToggle from "./LanguageToggle";
import { LogoMark } from "./Logo";

export default function SiteHeader({ overDark = false }: { overDark?: boolean }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    // Read the initial position on the next frame rather than during the
    // effect, so the first paint always matches the server render.
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/courses", label: t.nav.courses },
    { href: "/playground", label: t.nav.playground },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Light-on-dark while sitting over a dark hero; flips to ink-on-cream on scroll.
  const light = overDark && !scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-dune/70 bg-cream/85 backdrop-blur-xl shadow-[0_18px_50px_-40px_rgba(7,30,41,.8)]"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="RootSym">
            <span className="relative">
              <LogoMark
                tone={light ? "light" : "dark"}
                className="h-10 w-10 transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 -z-10 rounded-full bg-gold/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <span className="flex flex-col leading-none">
              <span
                className={`font-display text-xl font-bold tracking-tight transition-colors duration-300 ${
                  light ? "text-cream" : "text-abyss"
                }`}
              >
                RootSym
              </span>
              <span
                className={`mt-[3px] text-[0.55rem] font-semibold uppercase tracking-[0.28em] transition-colors duration-300 ${
                  light ? "text-brass" : "text-slate-ink"
                }`}
              >
                By Rand Saleh
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  light
                    ? isActive(l.href)
                      ? "text-cream"
                      : "text-sky/70 hover:text-cream"
                    : isActive(l.href)
                      ? "text-abyss"
                      : "text-slate-ink hover:text-abyss"
                }`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-4 -bottom-0.5 h-px origin-center bg-gradient-to-r from-transparent via-gold to-transparent transition-transform duration-500 ${
                    isActive(l.href) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageToggle tone={light ? "dark" : "light"} />
            <Link
              href="/courses"
              className="btn-gold hidden !px-5 !py-2.5 !text-[0.82rem] sm:inline-flex"
            >
              {t.nav.enrol}
              <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-gold hover:text-gold lg:hidden ${
                light ? "border-sky/25 text-cream" : "border-abyss/15 text-abyss"
              }`}
              aria-label={t.nav.menu}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div className={`hairline h-px w-full transition-opacity duration-500 ${scrolled ? "opacity-60" : "opacity-0"}`} />
      </header>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-x-0 top-[72px] origin-top rounded-b-[2rem] border-b border-dune bg-cream px-6 pb-8 pt-6 shadow-lux transition-all duration-500 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
          }`}
        >
          <nav className="flex flex-col">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between border-b border-dune/60 py-4 font-display text-2xl text-abyss transition-colors hover:text-gold"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {l.label}
                <ArrowUpRight className="h-5 w-5 flip-x opacity-40 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
          <Link href="/courses" onClick={() => setOpen(false)} className="btn-gold mt-6 w-full">
            {t.nav.enrol}
          </Link>
        </div>
      </div>
    </>
  );
}
