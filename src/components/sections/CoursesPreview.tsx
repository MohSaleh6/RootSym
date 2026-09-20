"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { CourseDTO } from "@/lib/courses";
import Reveal from "@/components/Reveal";
import CourseCard from "@/components/CourseCard";

export default function CoursesPreview({ courses }: { courses: CourseDTO[] }) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Reveal>
              <span className="eyebrow text-teal">{t.courses.eyebrow}</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.1rem)] font-light leading-[1.08] text-abyss text-balance-pretty">
                {t.courses.title}
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-5 text-[0.96rem] leading-relaxed text-slate-ink">
                {t.courses.lead}
              </p>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <Link
              href="/courses"
              className="group inline-flex items-center gap-2 rounded-full border border-abyss/15 px-6 py-3 text-sm font-semibold text-abyss transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink"
            >
              {t.courses.allCourses}
              <ArrowUpRight className="h-4 w-4 flip-x transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        {courses.length === 0 ? (
          <Reveal delay={120}>
            <p className="mt-14 rounded-3xl border border-dashed border-dune bg-parchment/60 p-14 text-center text-slate-ink">
              {t.courses.empty}
            </p>
          </Reveal>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course, i) => (
              <Reveal key={course.id} delay={i * 90}>
                <CourseCard course={course} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
