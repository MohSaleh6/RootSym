"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Clock, Users, Video, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatJod, perSeat } from "@/lib/money";
import type { CourseDTO } from "@/lib/courses";
import Reveal from "@/components/Reveal";
import CourseIcon from "@/components/CourseIcon";

export default function SignatureCourse({ course }: { course: CourseDTO }) {
  const { t, pick, pickList, fill, locale } = useI18n();
  const outcomes = pickList(course.outcomes, course.outcomesAr).slice(0, 5);
  const accent = course.accentColor || "#2e86ab";

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-cream lg:py-32">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -right-24 top-10 h-[28rem] w-[28rem] rounded-full bg-tide/18 blur-[130px] animate-drift" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-gold/10 blur-[120px] animate-drift [animation-delay:-6s]" />
      <div className="gold-rule absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* left: pitch */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/8 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-brass">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                {t.signature.eyebrow}
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h2 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.3rem)] font-light leading-[1.06]">
                {pick(course.title, course.titleAr)}
                <span className="mt-2 block text-[0.52em] font-normal italic text-brass">
                  {pick(course.tagline, course.taglineAr)}
                </span>
              </h2>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-sky/80">
                {pick(course.summary, course.summaryAr)}
              </p>
            </Reveal>

            <Reveal delay={230}>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[0.78rem] text-sky/65">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brass" strokeWidth={1.6} />
                  {fill(t.courses.hours, { n: course.durationHours })}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-brass" strokeWidth={1.6} />
                  {fill(t.courses.seats, { n: course.maxAttendees })}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Video className="h-4 w-4 text-brass" strokeWidth={1.6} />
                  {course.deliveryMode}
                </span>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <h3 className="mt-10 eyebrow text-brass">{t.signature.learn}</h3>
              <ul className="mt-5 space-y-3.5">
                {outcomes.map((o, i) => (
                  <li
                    key={i}
                    className="group flex items-start gap-3.5 text-[0.92rem] leading-relaxed text-cream/80"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-leaf/45 bg-leaf/12 transition-all duration-500 group-hover:scale-110 group-hover:border-gold group-hover:bg-gold/20">
                      <Check className="h-3 w-3 text-sprout transition-colors group-hover:text-gold" strokeWidth={2.6} />
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={380}>
              <div className="mt-10 flex flex-wrap gap-3.5">
                <Link href={`/courses/${course.slug}`} className="btn-gold">
                  {t.signature.cta}
                  <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
                </Link>
                <Link
                  href={`/checkout/${course.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-sky/25 px-7 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
                >
                  {t.signature.ctaBook}
                </Link>
              </div>
            </Reveal>
          </div>

          {/* right: pricing */}
          <Reveal delay={200} x={0} y={40}>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[2.4rem] bg-gradient-to-br from-gold/12 via-transparent to-tide/12 blur-2xl" />

              <div className="relative overflow-hidden rounded-[1.9rem] border border-sky/15 bg-gradient-to-br from-deep/55 to-ink/85 p-1.5 backdrop-blur-xl">
                <div className="rounded-[1.6rem] border border-sky/10 bg-ink/40 p-7 sm:p-9">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `${accent}1f`, border: `1px solid ${accent}44` }}
                    >
                      <CourseIcon name={course.icon} className="h-5 w-5" style={{ color: "#dcb75a" }} />
                    </span>
                    <h3 className="eyebrow text-brass">{t.course.pricing}</h3>
                  </div>

                  <div className="mt-7 space-y-4">
                    {/* individual */}
                    <div className="group relative overflow-hidden rounded-2xl border border-sky/14 bg-white/[0.03] p-6 transition-all duration-500 hover:border-gold/40 hover:bg-gold/[0.05]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-sky/60">
                            {t.signature.priceIndividual}
                          </p>
                          <p className="mt-3 font-display text-4xl font-semibold text-cream">
                            {formatJod(course.priceIndividual, locale)}
                          </p>
                        </div>
                        <Link
                          href={`/checkout/${course.slug}?type=individual`}
                          className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky/25 text-cream transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink"
                          aria-label={t.course.bookIndividual}
                        >
                          <ArrowUpRight className="h-4 w-4 flip-x" />
                        </Link>
                      </div>
                      <p className="mt-3 text-[0.82rem] leading-relaxed text-sky/60">
                        {t.course.individualDesc}
                      </p>
                    </div>

                    {/* company */}
                    <div className="group relative overflow-hidden rounded-2xl border border-gold/35 bg-gradient-to-br from-gold/[0.09] to-transparent p-6 transition-all duration-500 hover:border-gold/70">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brass">
                            {t.signature.priceCompany}
                          </p>
                          <span className="mt-2 inline-flex items-center rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-[0.62rem] font-semibold tracking-wide text-brass">
                            {fill(t.signature.upTo, { n: course.maxAttendees })}
                          </span>
                          <p className="mt-3 font-display text-4xl font-semibold gold-text">
                            {formatJod(course.priceCompany, locale)}
                          </p>
                          <p className="mt-1.5 text-[0.72rem] text-sky/55">
                            {fill(t.signature.perSeat, {
                              price: formatJod(perSeat(course.priceCompany, course.maxAttendees), locale),
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-[0.82rem] leading-relaxed text-sky/65">
                        {t.course.companyDesc}
                      </p>
                      <Link
                        href={`/checkout/${course.slug}?type=company`}
                        className="btn-gold mt-5 w-full !py-3 !text-[0.82rem]"
                      >
                        {t.course.bookCompany}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-7 border-t border-sky/10 pt-6">
                    <p className="eyebrow text-sky/50">{t.course.included}</p>
                    <ul className="mt-4 space-y-2.5">
                      {t.course.includedItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[0.8rem] leading-relaxed text-sky/70">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" strokeWidth={2.4} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
