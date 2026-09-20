"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { siteConfig } from "@/content/profile";
import { LogoMark } from "./Logo";

export default function SiteFooter() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-tide/10 blur-[120px]" />
      <div className="gold-rule absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <LogoMark className="h-12 w-12" tone="light" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-2xl font-bold">RootSym</span>
                <span className="mt-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-brass">
                  By Rand Saleh
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-sky/70">
              {t.footer.builtLine}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cream/55">
              {t.contact.based}
            </p>
          </div>

          <div>
            <h3 className="eyebrow text-brass">{t.footer.explore}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { href: "/courses", label: t.nav.courses },
                { href: "/playground", label: t.nav.playground },
                { href: "/about", label: t.nav.about },
                { href: "/contact", label: t.nav.contact },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-underline text-cream/70 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-brass">{t.footer.legal}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { href: "/legal/terms", label: t.footer.terms },
                { href: "/legal/privacy", label: t.footer.privacy },
                { href: "/legal/refunds", label: t.footer.refund },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-underline text-cream/70 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-brass">{t.footer.connect}</h3>
            <ul className="mt-5 space-y-3.5 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="group flex items-center gap-3 text-cream/70 transition-colors hover:text-gold"
                >
                  <Mail className="h-4 w-4 shrink-0 text-tide" strokeWidth={1.6} />
                  <span className="break-all">{siteConfig.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phoneHref}`}
                  dir="ltr"
                  className="group flex items-center gap-3 text-cream/70 transition-colors hover:text-gold"
                >
                  <Phone className="h-4 w-4 shrink-0 text-tide" strokeWidth={1.6} />
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-cream/70">
                <MapPin className="h-4 w-4 shrink-0 text-tide" strokeWidth={1.6} />
                {locale === "ar" ? siteConfig.locationAr : siteConfig.location}
              </li>
              {siteConfig.linkedin && (
                <li>
                  <a
                    href={siteConfig.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-cream/70 transition-colors hover:text-gold"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-tide" aria-hidden="true">
                      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.86V21h-4V9Z" />
                    </svg>
                    LinkedIn
                    <ArrowUpRight className="h-3.5 w-3.5 flip-x" />
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-sky/10 pt-7 text-xs text-cream/45 sm:flex-row">
          <p>
            © {year} RootSym — {t.footer.rights}
          </p>
          <Link href="/admin" className="transition-colors hover:text-brass">
            {t.nav.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
