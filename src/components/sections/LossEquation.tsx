"use client";

import { Activity, Cog, Sprout, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import Reveal from "@/components/Reveal";

const ICONS = [Activity, Cog, Sprout, ShieldCheck];
const ACCENTS = ["#e07a28", "#2e86ab", "#2f6b4f", "#c9a227"];

export default function LossEquation() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-45" />
      <div className="pointer-events-none absolute start-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow text-ember">{t.problem.eyebrow}</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.2rem)] font-light leading-[1.08] text-abyss text-balance-pretty">
              {t.problem.title}
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mx-auto mt-6 max-w-2xl text-[0.98rem] leading-relaxed text-slate-ink">
              {t.problem.lead}
            </p>
          </Reveal>
        </div>

        <div className="relative mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* connecting spine */}
          <div className="pointer-events-none absolute inset-x-0 top-[68px] hidden h-px lg:block">
            <div className="mx-[12%] h-px bg-gradient-to-r from-ember/40 via-tide/40 to-gold/60" />
          </div>

          {t.problem.cards.map((card, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={card.title} delay={i * 110} className="group relative">
                <article className="corner-frame relative h-full overflow-hidden rounded-3xl border border-dune bg-parchment p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-lux">
                  <span
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                    style={{ background: ACCENTS[i] }}
                  />
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `${ACCENTS[i]}14`, border: `1px solid ${ACCENTS[i]}33` }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.5} style={{ color: ACCENTS[i] }} />
                    <span
                      className="absolute inset-0 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-60"
                      style={{ background: `${ACCENTS[i]}44` }}
                    />
                  </div>

                  <div className="mt-6 flex items-baseline gap-2.5">
                    <span className="font-mono text-[0.68rem] text-slate-ink/50">
                      0{i + 1}
                    </span>
                    <h3 className="font-display text-2xl font-semibold text-abyss">
                      {card.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-[0.9rem] leading-relaxed text-slate-ink">
                    {card.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
