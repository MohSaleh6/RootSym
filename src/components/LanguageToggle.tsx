"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export default function LanguageToggle({
  tone = "light",
  compact = false,
}: {
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  const { t, toggle, locale } = useI18n();

  const base =
    "group relative inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300";
  const skin =
    tone === "dark"
      ? "border-sky/25 bg-white/5 text-cream hover:border-gold/60 hover:bg-gold/10"
      : "border-abyss/15 bg-parchment/70 text-abyss hover:border-gold hover:bg-gold/10";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${base} ${skin}`}
      aria-label={t.nav.languageLabel}
      title={t.nav.languageLabel}
      lang={locale === "en" ? "ar" : "en"}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Globe
          className="h-4 w-4 transition-transform duration-700 group-hover:rotate-180"
          strokeWidth={1.6}
        />
      </span>
      {!compact && <span className="whitespace-nowrap">{t.nav.language}</span>}
      <span className="pointer-events-none absolute inset-0 rounded-full ring-0 ring-gold/40 transition-all duration-500 group-hover:ring-4" />
    </button>
  );
}
