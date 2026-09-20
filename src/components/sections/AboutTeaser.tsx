"use client";

import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { experience, skills } from "@/content/profile";
import Reveal from "@/components/Reveal";
import { LogoMark } from "@/components/Logo";

export default function AboutTeaser() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const highlights = experience.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-35" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* emblem panel instead of a portrait */}
          <Reveal>
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rounded-full border border-dune" />
              <div className="absolute inset-6 rounded-full border border-gold/30 animate-spin-slower" style={{ borderStyle: "dashed" }} />
              <div className="absolute inset-12 rounded-full border border-teal/20 animate-spin-slow" style={{ borderStyle: "dotted" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <LogoMark className="h-48 w-48 drop-shadow-[0_20px_45px_rgba(7,30,41,.18)]" />
              </div>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="absolute h-2.5 w-2.5 rounded-full bg-gold/70 animate-float"
                  style={{
                    top: `${50 - Math.cos((i / 4) * Math.PI * 2) * 46}%`,
                    left: `${50 + Math.sin((i / 4) * Math.PI * 2) * 46}%`,
                    animationDelay: `${i * 0.7}s`,
                  }}
                />
              ))}
            </div>
          </Reveal>

          <div>
            <Reveal>
              <span className="eyebrow text-ember">{t.about.eyebrow}</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.1rem)] font-light leading-[1.06] text-abyss">
                {t.about.title}
                <span className="mt-2.5 block text-[0.42em] font-semibold uppercase tracking-[0.18em] text-teal">
                  {t.about.role}
                </span>
              </h2>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative mt-7 rounded-2xl border border-dune bg-parchment/70 p-6">
                <Quote className="absolute -top-3 start-6 h-6 w-6 rounded-full bg-cream p-1 text-gold" strokeWidth={1.6} />
                <p className="text-[0.95rem] leading-relaxed text-slate-ink">{t.about.lead}</p>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <ul className="mt-8 space-y-4">
                {highlights.map((item, i) => (
                  <li
                    key={i}
                    className="group flex items-start gap-4 border-b border-dune/70 pb-4 transition-colors last:border-0"
                  >
                    <span className="mt-1 font-mono text-[0.68rem] text-slate-ink/55 whitespace-nowrap" dir="ltr">
                      {item.start.slice(3)}–{item.end.slice(3)}
                    </span>
                    <span>
                      <span className="block text-[0.92rem] font-semibold text-abyss transition-colors group-hover:text-teal">
                        {isAr ? item.roleAr : item.role}
                      </span>
                      <span className="mt-0.5 block text-[0.82rem] text-slate-ink">
                        {isAr ? item.companyAr : item.company}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={290}>
              <div className="mt-7 flex flex-wrap gap-2">
                {skills.slice(0, 7).map((s) => (
                  <span
                    key={s.en}
                    className="rounded-full border border-dune bg-parchment px-3.5 py-1.5 text-[0.72rem] text-slate-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:text-abyss"
                  >
                    {isAr ? s.ar : s.en}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={350}>
              <Link href="/about" className="btn-outline mt-9">
                {t.about.more}
                <ArrowUpRight className="h-4 w-4 flip-x" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
