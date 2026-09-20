"use client";

import Link from "next/link";
import { ArrowUpRight, CircleCheck, Clock3, Mail, Banknote } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import Reveal from "@/components/Reveal";

export default function SuccessView({
  paid,
  reference,
  courseTitle,
  accessPath,
  instructions,
  amount,
}: {
  paid: boolean;
  reference: string | null;
  courseTitle: string | null;
  accessPath: string | null;
  instructions: string | null;
  amount: string | null;
}) {
  const { t } = useI18n();
  const copy = paid ? t.success.paid : t.success.pending;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ink py-32 text-cream">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute start-1/2 top-1/3 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-gold/12 blur-[140px] animate-drift" />

      <div className="relative mx-auto w-full max-w-2xl px-5 sm:px-8">
        <Reveal>
          <span
            className={`relative inline-flex h-20 w-20 items-center justify-center rounded-full border ${
              paid ? "border-leaf/40 bg-leaf/10" : "border-gold/40 bg-gold/10"
            }`}
          >
            <span className="absolute inset-0 rounded-full border border-gold/30 animate-pulse-ring" />
            {paid ? (
              <CircleCheck className="h-9 w-9 text-sprout" strokeWidth={1.4} />
            ) : (
              <Clock3 className="h-9 w-9 text-brass" strokeWidth={1.4} />
            )}
          </span>
        </Reveal>

        <Reveal delay={90}>
          <h1 className="mt-8 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-light leading-[1.05]">
            {copy.title}
          </h1>
        </Reveal>

        <Reveal delay={150}>
          <p className="mt-5 text-[1rem] leading-relaxed text-sky/80">{copy.lead}</p>
        </Reveal>

        {courseTitle && (
          <Reveal delay={200}>
            <p className="mt-6 font-display text-xl text-brass">{courseTitle}</p>
          </Reveal>
        )}

        {reference && (
          <Reveal delay={240}>
            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-sky/20 bg-white/[0.04] px-5 py-4">
              <span className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-sky/55">
                {t.success.reference}
              </span>
              <span className="font-mono text-lg font-semibold text-cream" dir="ltr">
                {reference}
              </span>
            </div>
          </Reveal>
        )}

        {!paid && instructions && (
          <Reveal delay={290}>
            <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/[0.06] p-6">
              <p className="flex items-center gap-2.5 eyebrow text-brass">
                <Banknote className="h-4 w-4" strokeWidth={1.8} />
                {t.success.transferTitle}
              </p>
              {amount && (
                <p className="mt-4 font-display text-3xl font-semibold text-cream">{amount}</p>
              )}
              <pre className="mt-4 whitespace-pre-wrap font-sans text-[0.88rem] leading-relaxed text-sky/85">
                {instructions}
              </pre>
            </div>
          </Reveal>
        )}

        <Reveal delay={340}>
          <div className="mt-10 flex flex-wrap gap-3.5">
            {paid && accessPath && (
              <Link href={accessPath} className="btn-gold">
                {t.success.openNow}
                <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-sky/25 px-7 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
            >
              {t.success.backHome}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-12 flex items-start gap-3 border-t border-sky/12 pt-7 text-[0.84rem] text-sky/60">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={1.7} />
            <span>
              <strong className="block font-semibold text-cream/85">{t.success.checkEmail}</strong>
              {t.success.checkEmailBody}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
