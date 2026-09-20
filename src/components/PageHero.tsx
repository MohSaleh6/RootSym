"use client";

import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function PageHero({
  eyebrow,
  title,
  lead,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden bg-ink text-cream ${compact ? "pb-16 pt-32" : "pb-24 pt-40"}`}
    >
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[26rem] w-[26rem] rounded-full bg-teal/22 blur-[130px] animate-drift" />
      <div className="pointer-events-none absolute -right-24 bottom-[-6rem] h-[24rem] w-[24rem] rounded-full bg-gold/10 blur-[120px] animate-drift [animation-delay:-7s]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {eyebrow && (
          <Reveal>
            <span className="eyebrow text-brass">{eyebrow}</span>
          </Reveal>
        )}
        <Reveal delay={90}>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.2rem,5vw,3.9rem)] font-light leading-[1.05] text-balance-pretty">
            {title}
          </h1>
        </Reveal>
        {lead && (
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-sky/80">{lead}</p>
          </Reveal>
        )}
        {children && <Reveal delay={230}>{children}</Reveal>}
      </div>

      <div className="gold-rule absolute inset-x-0 bottom-0" />
    </section>
  );
}
