"use client";

import Link from "next/link";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import FiveWhys from "@/components/games/FiveWhys";
import Fishbone from "@/components/games/Fishbone";
import RootOrSymptom from "@/components/games/RootOrSymptom";
import LossHunter from "@/components/games/LossHunter";
import ParetoFocus from "@/components/games/ParetoFocus";
import CtaBand from "@/components/sections/CtaBand";

export default function PlaygroundView({ courseSlug }: { courseSlug: string | null }) {
  const { t } = useI18n();

  return (
    <>
      <PageHero eyebrow={t.playground.eyebrow} title={t.playground.title} lead={t.playground.lead} compact>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#fiveWhys" className="btn-gold">
            <Gamepad2 className="h-4 w-4" strokeWidth={1.9} />
            {t.playground.play}
          </a>
          {courseSlug && (
            <Link
              href={`/courses/${courseSlug}`}
              className="inline-flex items-center gap-2 rounded-full border border-sky/25 px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
            >
              {t.signature.cta}
              <ArrowUpRight className="h-4 w-4 flip-x" />
            </Link>
          )}
        </div>
      </PageHero>

      <section className="relative overflow-hidden bg-cream py-14 lg:py-20">
        <div className="blueprint pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-4xl space-y-10 px-5 sm:px-8">
          <Reveal>
            <FiveWhys index={1} />
          </Reveal>
          <Reveal>
            <RootOrSymptom index={2} />
          </Reveal>
          <Reveal>
            <Fishbone index={3} />
          </Reveal>
          <Reveal>
            <LossHunter index={4} />
          </Reveal>
          <Reveal>
            <ParetoFocus index={5} />
          </Reveal>
        </div>
      </section>

      <CtaBand href={courseSlug ? `/courses/${courseSlug}` : "/courses"} />
    </>
  );
}
