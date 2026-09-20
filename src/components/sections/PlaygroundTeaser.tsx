"use client";

import Link from "next/link";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import Reveal from "@/components/Reveal";

const KEYS = ["fiveWhys", "fishbone", "rootOrSymptom", "lossHunter", "pareto"] as const;
const TINTS = ["#2e86ab", "#2f6b4f", "#e07a28", "#c9a227", "#1b5e75"];

export default function PlaygroundTeaser() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-sand py-24 lg:py-32">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-tide/10 blur-[100px] animate-drift" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 eyebrow text-moss">
              <Gamepad2 className="h-4 w-4" strokeWidth={1.8} />
              {t.playground.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.1rem)] font-light leading-[1.08] text-abyss text-balance-pretty">
              {t.playground.title}
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-5 text-[0.96rem] leading-relaxed text-slate-ink">
              {t.playground.lead}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KEYS.map((key, i) => {
            const game = t.playground.games[key];
            return (
              <Reveal key={key} delay={i * 80}>
                <Link
                  href={`/playground#${key}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-dune bg-parchment p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-lux"
                >
                  <span
                    className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.07] transition-all duration-700 group-hover:scale-[2.6] group-hover:opacity-[0.12]"
                    style={{ background: TINTS[i] }}
                  />
                  <span
                    className="font-mono text-[0.68rem] tracking-widest"
                    style={{ color: TINTS[i] }}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="relative mt-3 font-display text-xl font-semibold text-abyss">
                    {game.title}
                  </h3>
                  <p className="relative mt-2.5 flex-1 text-[0.86rem] leading-relaxed text-slate-ink">
                    {game.desc}
                  </p>
                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-teal transition-colors group-hover:text-gold">
                    {t.playground.play}
                    <ArrowUpRight className="h-3.5 w-3.5 flip-x transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}

          <Reveal delay={400}>
            <Link
              href="/playground"
              className="group relative flex h-full min-h-[190px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-abyss/20 bg-gradient-to-br from-abyss to-ink p-6 text-cream transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lux"
            >
              <div className="blueprint-dark absolute inset-0 opacity-60" />
              <Gamepad2 className="relative h-8 w-8 text-brass transition-transform duration-500 group-hover:scale-110" strokeWidth={1.4} />
              <span className="relative font-display text-xl">{t.playground.eyebrow}</span>
              <span className="relative inline-flex items-center gap-1.5 text-[0.78rem] text-brass">
                {t.playground.play}
                <ArrowUpRight className="h-3.5 w-3.5 flip-x" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
