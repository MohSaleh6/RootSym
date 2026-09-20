"use client";

import Link from "next/link";
import { Compass, Mail } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { CourseDTO } from "@/lib/courses";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import CourseCard from "@/components/CourseCard";
import CtaBand from "@/components/sections/CtaBand";

export default function CoursesView({ courses }: { courses: CourseDTO[] }) {
  const { t } = useI18n();

  return (
    <>
      <PageHero
        eyebrow={t.courses.eyebrow}
        title={t.courses.title}
        lead={t.courses.lead}
      />

      <section className="relative overflow-hidden bg-cream pb-24 pt-8 lg:pb-32">
        <div className="blueprint pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          {courses.length === 0 ? (
            <Reveal>
              <p className="rounded-3xl border border-dashed border-dune bg-parchment/60 p-16 text-center text-slate-ink">
                {t.courses.empty}
              </p>
            </Reveal>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, i) => (
                <Reveal key={course.id} delay={i * 80}>
                  <CourseCard course={course} index={i} />
                </Reveal>
              ))}

              <Reveal delay={courses.length * 80}>
                <Link
                  href="/contact"
                  className="group flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-[1.6rem] border border-dashed border-dune bg-parchment/50 p-8 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/60 hover:bg-parchment"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dune bg-cream transition-transform duration-500 group-hover:scale-110">
                    <Compass className="h-6 w-6 text-teal" strokeWidth={1.5} />
                  </span>
                  <span className="font-display text-xl font-semibold text-abyss">
                    {t.courses.soon}
                  </span>
                  <span className="max-w-[16rem] text-[0.86rem] leading-relaxed text-slate-ink">
                    {t.cta.lead}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-2 text-[0.8rem] font-semibold text-teal transition-colors group-hover:text-gold">
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.8} />
                    {t.cta.secondary}
                  </span>
                </Link>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
