"use client";

import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import Reveal from "@/components/Reveal";

export default function CtaBand({ href = "/courses" }: { href?: string }) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-ink py-20 text-cream lg:py-28">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute start-1/2 top-1/2 h-[28rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[130px] animate-drift" />
      <div className="gold-rule absolute inset-x-0 top-0" />
      <div className="gold-rule absolute inset-x-0 bottom-0" />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-sky/20 px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-brass">
            <Users className="h-3.5 w-3.5" strokeWidth={1.8} />
            max 15 attendees
          </span>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="mt-7 font-display text-[clamp(2.1rem,5vw,3.6rem)] font-light leading-[1.05]">
            {t.cta.title}
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-sky/75">
            {t.cta.lead}
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link href={href} className="btn-gold">
              {t.cta.button}
              <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-sky/25 px-7 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
            >
              {t.cta.secondary}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
