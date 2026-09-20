"use client";

import Link from "next/link";
import { ArrowUpRight, Video, MousePointerClick } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import RootSystem3D from "@/components/RootSystem3D";
import Reveal from "@/components/Reveal";

export default function Hero() {
  const { t } = useI18n();

  const stats = [t.hero.stat1, t.hero.stat2, t.hero.stat3];

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-ink pt-[72px] text-cream">
      {/* atmosphere */}
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-teal/25 blur-[140px] animate-drift" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-moss/20 blur-[130px] animate-drift [animation-delay:-8s]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

      {/* the 3D structure */}
      <RootSystem3D className="pointer-events-none absolute inset-y-0 end-[-6%] hidden h-full w-[62%] opacity-95 lg:block" />
      <RootSystem3D className="pointer-events-none absolute inset-x-0 bottom-0 block h-[52%] w-full opacity-55 lg:hidden" />

      {/* corner engineering ticks */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="hero-tick" x1="0" x2="1">
            <stop offset="0%" stopColor="#c9a227" stopOpacity="0" />
            <stop offset="50%" stopColor="#c9a227" stopOpacity=".65" />
            <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#hero-tick)" strokeWidth="1" opacity=".22" />
      </svg>

      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-7xl flex-col justify-center px-5 pb-28 pt-16 sm:px-8">
        <div className="max-w-2xl">
          <Reveal delay={60}>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/8 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-brass">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-75 animate-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              {t.hero.eyebrow}
            </span>
          </Reveal>

          <Reveal delay={140}>
            <h1 className="mt-7 font-display text-[clamp(2.6rem,7.2vw,5.1rem)] font-light leading-[0.97] tracking-tight">
              <span className="block text-cream/90">{t.hero.title1}</span>
              <span className="relative block">
                <span className="gold-text font-semibold italic">{t.hero.titleAccent}</span>
                <svg
                  className="absolute -bottom-2 start-0 h-3 w-[min(100%,20rem)]"
                  viewBox="0 0 320 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C60 3 120 3 180 7s90 2 138-4"
                    stroke="#c9a227"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="340"
                    strokeDashoffset="340"
                    className="animate-draw"
                    style={{ animationDelay: "0.9s" }}
                  />
                </svg>
              </span>
              <span className="mt-3 block text-cream">{t.hero.title2}</span>
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-8 max-w-xl text-[1.02rem] leading-relaxed text-sky/85">
              {t.hero.lead}
            </p>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-10 flex flex-wrap items-center gap-3.5">
              <Link href="/courses" className="btn-gold">
                {t.hero.ctaPrimary}
                <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-sky/25 px-7 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
              >
                {t.hero.ctaSecondary}
              </Link>
              <span className="inline-flex items-center gap-2 text-xs text-sky/60">
                <Video className="h-4 w-4" strokeWidth={1.6} />
                {t.hero.badge}
              </span>
            </div>
          </Reveal>

          <Reveal delay={420}>
            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-5 border-t border-sky/15 pt-8">
              {stats.map((s, i) => (
                <div key={i} className="group">
                  <dt className="font-display text-4xl font-semibold text-brass transition-transform duration-500 group-hover:-translate-y-0.5">
                    {s.value}
                  </dt>
                  <dd className="mt-2 text-[0.7rem] leading-snug text-sky/60">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="pointer-events-none absolute bottom-20 start-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-sky/45 lg:flex">
          <MousePointerClick className="h-4 w-4 animate-float" strokeWidth={1.4} />
          {t.hero.scroll}
        </div>
      </div>

      {/* crisp finish into the cream body */}
      <div className="gold-rule absolute inset-x-0 bottom-0 opacity-70" />
    </section>
  );
}
