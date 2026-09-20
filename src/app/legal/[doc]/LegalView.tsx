"use client";

import { useI18n } from "@/i18n/provider";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";

export type LegalDoc = {
  title: { en: string; ar: string };
  updated: string;
  sections: { h: { en: string; ar: string }; p: { en: string; ar: string }[] }[];
};

export default function LegalView({ doc }: { doc: LegalDoc }) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <>
      <PageHero
        eyebrow={isAr ? "قانوني" : "Legal"}
        title={isAr ? doc.title.ar : doc.title.en}
        lead={
          isAr ? `آخر تحديث: ${doc.updated}` : `Last updated: ${doc.updated}`
        }
        compact
      />

      <section className="relative overflow-hidden bg-cream py-16 lg:py-24">
        <div className="blueprint pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <div className="space-y-10">
            {doc.sections.map((section, i) => (
              <Reveal key={i} delay={i * 60}>
                <h2 className="font-display text-[1.6rem] font-semibold text-abyss">
                  {isAr ? section.h.ar : section.h.en}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.p.map((p, j) => (
                    <p key={j} className="text-[0.95rem] leading-relaxed text-slate-ink">
                      {isAr ? p.ar : p.en}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
