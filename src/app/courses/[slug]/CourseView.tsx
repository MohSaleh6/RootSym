"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  Clock,
  Users,
  Video,
  GraduationCap,
  Languages,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatJod, perSeat } from "@/lib/money";
import { formatLongDate, formatTime } from "@/lib/datetime";
import type { CourseDTO } from "@/lib/courses";
import Reveal from "@/components/Reveal";
import Accordion from "@/components/Accordion";
import CourseIcon from "@/components/CourseIcon";
import CtaBand from "@/components/sections/CtaBand";

export default function CourseView({ course }: { course: CourseDTO }) {
  const { t, pick, pickList, fill, locale } = useI18n();
  const accent = course.accentColor || "#2e86ab";
  const isAr = locale === "ar";

  const outcomes = pickList(course.outcomes, course.outcomesAr);
  const audience = pickList(course.audience, course.audienceAr);
  const faqs = course.faqs.map((f) => ({
    q: isAr && f.qAr ? f.qAr : f.q,
    a: isAr && f.aAr ? f.aAr : f.a,
  }));

  const meta = [
    { icon: Clock, label: t.course.duration, value: fill(t.courses.hours, { n: course.durationHours }) },
    { icon: Video, label: t.course.delivery, value: course.deliveryMode },
    { icon: Users, label: t.course.format, value: fill(t.courses.seats, { n: course.maxAttendees }) },
    { icon: GraduationCap, label: t.course.level, value: course.level },
    { icon: Languages, label: t.course.language, value: course.languageOfDelivery },
  ];



  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden bg-ink pb-24 pt-32 text-cream">
        <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
        {course.imageUrl && (
          <div className="pointer-events-none absolute inset-0 opacity-25">
            <Image src={course.imageUrl} alt="" fill unoptimized className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/60" />
          </div>
        )}
        <div
          className="pointer-events-none absolute -right-24 top-6 h-[26rem] w-[26rem] rounded-full blur-[130px] animate-drift"
          style={{ background: `${accent}2e` }}
        />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-gold/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-[0.78rem] font-semibold text-sky/60 transition-colors hover:text-brass"
            >
              <ArrowLeft className="h-3.5 w-3.5 flip-x" strokeWidth={2} />
              {t.course.backToCourses}
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <Reveal delay={70}>
                <span
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `${accent}1f`, border: `1px solid ${accent}4d` }}
                >
                  <CourseIcon name={course.icon} className="h-6 w-6" style={{ color: "#dcb75a" }} />
                </span>
              </Reveal>
              <Reveal delay={130}>
                <h1 className="mt-6 font-display text-[clamp(2.1rem,4.8vw,3.7rem)] font-light leading-[1.04] text-balance-pretty">
                  {pick(course.title, course.titleAr)}
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-4 font-display text-[1.35rem] italic text-brass">
                  {pick(course.tagline, course.taglineAr)}
                </p>
              </Reveal>
              <Reveal delay={260}>
                <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-sky/80">
                  {pick(course.summary, course.summaryAr)}
                </p>
              </Reveal>
            </div>

            <Reveal delay={320}>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href={`/checkout/${course.slug}?type=individual`} className="btn-gold">
                  {t.course.bookIndividual}
                  <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
                </Link>
                <Link
                  href={`/checkout/${course.slug}?type=company`}
                  className="inline-flex items-center gap-2 rounded-full border border-sky/25 px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
                >
                  {t.course.bookCompany}
                </Link>
              </div>
            </Reveal>
          </div>

          {/* meta strip */}
          <Reveal delay={380}>
            <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-sky/12 bg-sky/12 sm:grid-cols-3 lg:grid-cols-5">
              {meta.map((m) => (
                <div key={m.label} className="group bg-ink/80 p-5 transition-colors duration-500 hover:bg-deep/50">
                  <dt className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-sky/50">
                    <m.icon className="h-3.5 w-3.5 text-brass" strokeWidth={1.8} />
                    {m.label}
                  </dt>
                  <dd className="mt-2.5 text-[0.86rem] leading-snug text-cream/90">{m.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="gold-rule absolute inset-x-0 bottom-0" />
      </section>

      {/* ---------- body ---------- */}
      <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
        <div className="blueprint pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_22rem] lg:items-start">
            <div className="min-w-0 space-y-16">
              {/* overview */}
              <div>
                <Reveal>
                  <h2 className="eyebrow text-teal">{t.course.overview}</h2>
                </Reveal>
                <Reveal delay={80}>
                  <div className="mt-5 space-y-5">
                    {pick(course.description, course.descriptionAr)
                      .split("\n\n")
                      .filter(Boolean)
                      .map((para, i) => (
                        <p
                          key={i}
                          className={`leading-relaxed text-slate-ink ${
                            i === 0 ? "text-[1.05rem] text-abyss/90" : "text-[0.96rem]"
                          }`}
                        >
                          {para}
                        </p>
                      ))}
                  </div>
                </Reveal>
              </div>

              {/* outcomes */}
              {outcomes.length > 0 && (
                <div>
                  <Reveal>
                    <h2 className="eyebrow text-teal">{t.course.outcomes}</h2>
                  </Reveal>
                  <ul className="mt-6 grid gap-3.5 sm:grid-cols-2">
                    {outcomes.map((o, i) => (
                      <Reveal key={i} delay={i * 55}>
                        <li className="group flex h-full items-start gap-3.5 rounded-2xl border border-dune bg-parchment p-5 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lux">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-leaf/40 bg-leaf/10 transition-all duration-500 group-hover:border-gold group-hover:bg-gold/20">
                            <Check className="h-3.5 w-3.5 text-moss transition-colors group-hover:text-gold" strokeWidth={2.6} />
                          </span>
                          <span className="text-[0.92rem] leading-relaxed text-slate-ink">{o}</span>
                        </li>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              )}

              {/* modules */}
              {course.modules.length > 0 && (
                <div>
                  <Reveal>
                    <h2 className="eyebrow text-teal">{t.course.modules}</h2>
                  </Reveal>
                  <ol className="relative mt-7 space-y-4 ps-8">
                    <span className="absolute inset-y-2 start-[11px] w-px bg-gradient-to-b from-tide/50 via-moss/40 to-gold/50" />
                    {course.modules.map((m, i) => (
                      <Reveal key={i} delay={i * 60}>
                        <li className="group relative">
                          <span className="absolute -start-8 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-dune bg-cream text-[0.6rem] font-bold text-teal transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                            {i + 1}
                          </span>
                          <div className="rounded-2xl border border-dune bg-parchment p-6 transition-all duration-500 group-hover:border-gold/45 group-hover:shadow-lux">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              {m.clock && (
                                <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ember">
                                  {m.clock}
                                </span>
                              )}
                              <h3 className="font-display text-[1.25rem] font-semibold text-abyss">
                                {isAr && m.titleAr ? m.titleAr : m.title}
                              </h3>
                            </div>
                            <ul className="mt-3.5 space-y-2">
                              {(isAr && m.pointsAr?.length ? m.pointsAr : m.points).map((p, j) => (
                                <li key={j} className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-slate-ink">
                                  <span className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-gold" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      </Reveal>
                    ))}
                  </ol>
                </div>
              )}

              {/* audience + tools */}
              <div className="grid gap-8 sm:grid-cols-2">
                {audience.length > 0 && (
                  <div>
                    <Reveal>
                      <h2 className="eyebrow text-teal">{t.course.audience}</h2>
                    </Reveal>
                    <Reveal delay={70}>
                      <ul className="mt-5 space-y-3">
                        {audience.map((a, i) => (
                          <li key={i} className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-slate-ink">
                            <Users className="mt-0.5 h-4 w-4 shrink-0 text-moss" strokeWidth={1.7} />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  </div>
                )}
                {course.tools.length > 0 && (
                  <div>
                    <Reveal>
                      <h2 className="eyebrow text-teal">{t.course.tools}</h2>
                    </Reveal>
                    <Reveal delay={70}>
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {course.tools.map((tool) => (
                          <li
                            key={tool}
                            className="rounded-full border border-dune bg-parchment px-3.5 py-1.5 text-[0.76rem] text-slate-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:text-abyss"
                          >
                            {tool}
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  </div>
                )}
              </div>

              {/* faq */}
              {faqs.length > 0 && (
                <div>
                  <Reveal>
                    <h2 className="eyebrow text-teal">{t.course.faq}</h2>
                  </Reveal>
                  <Reveal delay={80}>
                    <div className="mt-6">
                      <Accordion items={faqs} />
                    </div>
                  </Reveal>
                </div>
              )}
            </div>

            {/* ---------- sticky sidebar ---------- */}
            <div className="lg:sticky lg:top-24">
              <Reveal delay={120}>
                <div className="overflow-hidden rounded-[1.5rem] border border-dune bg-parchment shadow-[0_30px_80px_-60px_rgba(7,30,41,.6)]">
                  <div className="relative bg-ink p-6 text-cream">
                    <div className="blueprint-dark absolute inset-0 opacity-60" />
                    <p className="relative eyebrow text-brass">{t.course.pricing}</p>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="rounded-2xl border border-dune bg-cream p-5">
                      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-ink/70">
                        {t.signature.priceIndividual}
                      </p>
                      <p className="mt-2 font-display text-3xl font-semibold text-abyss">
                        {formatJod(course.priceIndividual, locale)}
                      </p>
                      <p className="mt-2 text-[0.8rem] leading-relaxed text-slate-ink">
                        {t.course.individualDesc}
                      </p>
                      <Link
                        href={`/checkout/${course.slug}?type=individual`}
                        className="btn-ink mt-4 w-full !py-2.5 !text-[0.8rem]"
                      >
                        {t.course.bookIndividual}
                      </Link>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-br from-gold/10 to-transparent p-5">
                      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ember">
                        {t.signature.priceCompany}
                      </p>
                      <p className="mt-2 font-display text-3xl font-semibold text-abyss">
                        {formatJod(course.priceCompany, locale)}
                      </p>
                      <p className="mt-1 text-[0.72rem] text-slate-ink/80">
                        {fill(t.signature.upTo, { n: course.maxAttendees })} ·{" "}
                        {fill(t.signature.perSeat, {
                          price: formatJod(perSeat(course.priceCompany, course.maxAttendees), locale),
                        })}
                      </p>
                      <p className="mt-2 text-[0.8rem] leading-relaxed text-slate-ink">
                        {t.course.companyDesc}
                      </p>
                      <Link
                        href={`/checkout/${course.slug}?type=company`}
                        className="btn-gold mt-4 w-full !py-2.5 !text-[0.8rem]"
                      >
                        {t.course.bookCompany}
                      </Link>
                    </div>
                  </div>

                  {/* upcoming dates */}
                  <div className="border-t border-dune px-5 py-5">
                    <p className="eyebrow text-slate-ink/70">{t.course.upcoming}</p>
                    {course.sessions.length === 0 ? (
                      <p className="mt-3 text-[0.82rem] leading-relaxed text-slate-ink">
                        {t.course.noDates}
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2.5">
                        {course.sessions.slice(0, 3).map((s) => (
                          <li
                            key={s.id}
                            className="flex items-start gap-3 rounded-xl border border-dune/70 bg-cream px-3.5 py-3"
                          >
                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={1.7} />
                            <span>
                              <span className="block text-[0.82rem] font-semibold text-abyss">
                                {formatLongDate(s.startsAt, s.timezone, locale)}
                              </span>
                              <span className="mt-0.5 block text-[0.72rem] text-slate-ink">
                                {formatTime(s.startsAt, s.timezone, locale)} · {s.timezone} ·{" "}
                                {s.seatsLeft}/{s.seatsTotal}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* included */}
                  <div className="border-t border-dune bg-sand/50 px-5 py-5">
                    <p className="eyebrow text-slate-ink/70">{t.course.included}</p>
                    <ul className="mt-3 space-y-2">
                      {t.course.includedItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[0.78rem] leading-relaxed text-slate-ink">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss" strokeWidth={2.4} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <CtaBand href={`/checkout/${course.slug}?type=company`} />
    </>
  );
}
