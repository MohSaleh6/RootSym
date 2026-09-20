"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Languages,
  MapPin,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import {
  certifications,
  education,
  experience,
  siteConfig,
  skills,
  spokenLanguages,
} from "@/content/profile";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/sections/CtaBand";
import { LogoMark } from "@/components/Logo";

export default function AboutView() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <>
      <PageHero eyebrow={t.about.eyebrow} title={t.about.title} lead={t.about.lead}>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.82rem] text-sky/65">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brass" strokeWidth={1.7} />
            {t.about.role}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brass" strokeWidth={1.7} />
            {isAr ? siteConfig.locationAr : siteConfig.location}
          </span>
        </div>
        <Link href="/contact" className="btn-gold mt-9">
          {t.about.contactCta}
          <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
        </Link>
      </PageHero>

      {/* experience */}
      <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
        <div className="blueprint pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div>
              <Reveal>
                <h2 className="flex items-center gap-3 eyebrow text-teal">
                  <Briefcase className="h-4 w-4" strokeWidth={1.8} />
                  {t.about.experience}
                </h2>
              </Reveal>

              <ol className="relative mt-8 space-y-5 ps-9">
                <span className="absolute inset-y-3 start-[13px] w-px bg-gradient-to-b from-tide/50 via-moss/40 to-gold/50" />
                {experience.map((item, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <li className="group relative">
                      <span className="absolute -start-9 top-7 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-dune bg-cream transition-all duration-500 group-hover:border-gold">
                        <span
                          className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                            item.current ? "bg-gold" : "bg-teal group-hover:bg-gold"
                          }`}
                        />
                        {item.current && (
                          <span className="absolute inset-0 rounded-full border border-gold/40 animate-pulse-ring" />
                        )}
                      </span>

                      <div className="rounded-2xl border border-dune bg-parchment p-6 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-gold/45 group-hover:shadow-lux">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                          <h3 className="font-display text-[1.3rem] font-semibold leading-snug text-abyss">
                            {isAr ? item.roleAr : item.role}
                          </h3>
                          <span className="font-mono text-[0.7rem] text-slate-ink/70" dir="ltr">
                            {item.start} — {item.current ? t.about.present : item.end}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[0.9rem] font-medium text-teal">
                          {isAr ? item.companyAr : item.company}
                          <span className="text-slate-ink/60">
                            {" · "}
                            {isAr ? item.locationAr : item.location}
                          </span>
                        </p>
                        <ul className="mt-4 space-y-2">
                          {(isAr ? item.bulletsAr : item.bullets).map((b, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-slate-ink"
                            >
                              <span className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-gold" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>

            {/* sidebar */}
            <div className="space-y-5 lg:sticky lg:top-24">
              <Reveal delay={120}>
                <div className="relative overflow-hidden rounded-[1.4rem] border border-dune bg-parchment p-7 text-center">
                  <div className="pointer-events-none absolute inset-0 opacity-[0.05] blueprint" />
                  <LogoMark className="relative mx-auto h-24 w-24" />
                  <p className="relative mt-5 font-display text-2xl font-semibold text-abyss">
                    {t.about.title}
                  </p>
                  <p className="relative mt-2 text-[0.78rem] leading-relaxed text-slate-ink">
                    {t.about.role}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={170}>
                <div className="rounded-[1.4rem] border border-dune bg-parchment p-6">
                  <h3 className="flex items-center gap-2.5 eyebrow text-teal">
                    <GraduationCap className="h-4 w-4" strokeWidth={1.8} />
                    {t.about.education}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {education.map((e, i) => (
                      <li key={i}>
                        <p className="text-[0.92rem] font-semibold text-abyss">
                          {isAr ? e.degreeAr : e.degree}
                        </p>
                        <p className="mt-0.5 text-[0.84rem] text-slate-ink">
                          {isAr ? e.schoolAr : e.school}
                        </p>
                        <p className="mt-1 text-[0.76rem] text-slate-ink/70">
                          {isAr ? e.locationAr : e.location} · {isAr ? e.noteAr : e.note}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={220}>
                <div className="rounded-[1.4rem] border border-dune bg-parchment p-6">
                  <h3 className="flex items-center gap-2.5 eyebrow text-teal">
                    <Award className="h-4 w-4" strokeWidth={1.8} />
                    {t.about.certifications}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {certifications.map((c, i) => (
                      <li key={i}>
                        <p className="text-[0.9rem] font-semibold text-abyss">
                          {isAr ? c.titleAr : c.title}
                        </p>
                        <p className="mt-0.5 text-[0.8rem] text-slate-ink">
                          {isAr ? c.issuerAr : c.issuer}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={270}>
                <div className="rounded-[1.4rem] border border-dune bg-parchment p-6">
                  <h3 className="flex items-center gap-2.5 eyebrow text-teal">
                    <Languages className="h-4 w-4" strokeWidth={1.8} />
                    {t.about.languages}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {spokenLanguages.map((l, i) => (
                      <li key={i} className="text-[0.86rem] text-slate-ink">
                        {isAr ? l.ar : l.en}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>

          {/* skills */}
          <div className="mt-20">
            <Reveal>
              <h2 className="eyebrow text-teal">{t.about.skills}</h2>
            </Reveal>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {skills.map((s, i) => (
                <Reveal key={s.en} delay={i * 35}>
                  <span className="inline-block rounded-full border border-dune bg-parchment px-4 py-2 text-[0.8rem] text-slate-ink transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:bg-gold/8 hover:text-abyss">
                    {isAr ? s.ar : s.en}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
