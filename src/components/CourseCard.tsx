"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock, Users, Video } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatJod } from "@/lib/money";
import type { CourseDTO } from "@/lib/courses";
import CourseIcon from "./CourseIcon";

export default function CourseCard({ course, index = 0 }: { course: CourseDTO; index?: number }) {
  const { t, pick, fill, locale } = useI18n();
  const accent = course.accentColor || "#2e86ab";

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-dune bg-parchment transition-all duration-500 hover:-translate-y-2 hover:border-gold/45 hover:shadow-lux"
      style={{ transitionDelay: `${index * 30}ms` }}
    >
      {/* cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-abyss">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.07]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 120% at 20% 10%, ${accent}66 0%, #0b2a36 62%)`,
            }}
          />
        )}
        <div className="blueprint-dark absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
            style={{ background: `${accent}22`, border: `1px solid ${accent}55` }}
          >
            <CourseIcon name={course.icon} className="h-5 w-5" style={{ color: "#f1ead5" }} />
          </div>
          {course.featured && (
            <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-brass backdrop-blur-sm">
              {t.courses.featured}
            </span>
          )}
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-[1.45rem] font-semibold leading-snug text-abyss transition-colors duration-300 group-hover:text-teal">
          {pick(course.title, course.titleAr)}
        </h3>
        <p className="mt-2 text-[0.82rem] font-medium" style={{ color: accent }}>
          {pick(course.tagline, course.taglineAr)}
        </p>
        <p className="mt-3.5 line-clamp-3 text-[0.88rem] leading-relaxed text-slate-ink">
          {pick(course.summary, course.summaryAr)}
        </p>

        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[0.72rem] text-slate-ink/80">
          <li className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-teal" strokeWidth={1.7} />
            {fill(t.courses.hours, { n: course.durationHours })}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-teal" strokeWidth={1.7} />
            {fill(t.courses.seats, { n: course.maxAttendees })}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-teal" strokeWidth={1.7} />
            Microsoft Teams
          </li>
        </ul>

        <div className="mt-6 flex items-end justify-between gap-3 border-t border-dune/80 pt-5">
          <div>
            <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-ink/60">
              {t.courses.from}
            </span>
            <span className="font-display text-2xl font-semibold text-abyss">
              {formatJod(course.priceIndividual, locale)}
            </span>
          </div>
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-abyss/15 px-4 py-2.5 text-[0.78rem] font-semibold text-abyss transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink"
          >
            {t.courses.details}
            <ArrowUpRight className="h-3.5 w-3.5 flip-x transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${accent}, #c9a227)` }}
      />
    </article>
  );
}
