"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarPlus,
  Copy,
  Check,
  Lock,
  ShieldAlert,
  Clock3,
  Video,
  TriangleAlert,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatDateTime } from "@/lib/datetime";
import Reveal from "@/components/Reveal";
import { LogoMark } from "@/components/Logo";

export type AccessState = "ready" | "used" | "revoked" | "pending" | "not_found" | "tbc";

type Props = {
  token: string;
  initialState: AccessState;
  courseTitle: string | null;
  reference: string | null;
  startsAt: string | null;
  timezone: string | null;
  durationHours: number;
};

function icsHref(title: string, startsAt: string, hours: number, link: string) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + hours * 3600_000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RootSym//EN",
    "BEGIN:VEVENT",
    `UID:${stamp(start)}-rootsym`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title.replace(/[\n,;]/g, " ")}`,
    `DESCRIPTION:Join here: ${link}`,
    `LOCATION:Microsoft Teams`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export default function AccessView({
  token,
  initialState,
  courseTitle,
  reference,
  startsAt,
  timezone,
  durationHours,
}: Props) {
  const { t, locale } = useI18n();
  const [state, setState] = useState<AccessState>(initialState);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const dateFmt = startsAt ? formatDateTime(startsAt, timezone || "Asia/Amman", locale) : null;

  async function reveal() {
    setBusy(true);
    try {
      const res = await fetch(`/api/access/${token}`, { method: "POST" });
      const data = await res.json();
      if (data.state === "ready" && data.link) {
        setLink(data.link);
        setState("ready");
      } else {
        setState(data.state as AccessState);
      }
    } catch {
      setState("pending");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard can be blocked — the link is visible on screen anyway */
    }
  }

  const blocked: Partial<Record<AccessState, { icon: typeof Lock; title: string; body: string }>> = {
    used: { icon: Lock, title: t.access.used, body: t.access.usedLead },
    revoked: { icon: ShieldAlert, title: t.access.revoked, body: t.access.usedLead },
    pending: { icon: Clock3, title: t.access.pendingTitle, body: t.access.pendingLead },
    not_found: { icon: TriangleAlert, title: t.access.notFound, body: t.access.notFoundLead },
  };
  const block = blocked[state];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ink py-28 text-cream">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute start-1/2 top-1/3 h-[30rem] w-[42rem] -translate-x-1/2 rounded-full bg-tide/12 blur-[140px] animate-drift" />

      <div className="relative mx-auto w-full max-w-2xl px-5 sm:px-8">
        <Reveal>
          <Link href="/" className="inline-flex items-center gap-3">
            <LogoMark className="h-11 w-11" tone="light" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold">RootSym</span>
              <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-brass">
                By Rand Saleh
              </span>
            </span>
          </Link>
        </Reveal>

        <div className="mt-10 overflow-hidden rounded-[1.7rem] border border-sky/15 bg-gradient-to-br from-deep/45 to-ink/80 p-1.5 backdrop-blur-xl">
          <div className="rounded-[1.45rem] border border-sky/10 bg-ink/50 p-7 sm:p-10">
            {block ? (
              <Reveal>
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-ember/35 bg-ember/10">
                  <block.icon className="h-7 w-7 text-flame" strokeWidth={1.4} />
                </span>
                <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light leading-tight">
                  {block.title}
                </h1>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-sky/75">{block.body}</p>
                {reference && (
                  <p className="mt-6 inline-flex items-center gap-3 rounded-xl border border-sky/20 bg-white/[0.04] px-4 py-3">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-sky/55">
                      {t.access.ref}
                    </span>
                    <span className="font-mono text-base text-cream" dir="ltr">
                      {reference}
                    </span>
                  </p>
                )}
                <Link
                  href="/contact"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-sky/25 px-6 py-3 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
                >
                  {t.contact.title}
                  <ArrowUpRight className="h-4 w-4 flip-x" />
                </Link>
              </Reveal>
            ) : state === "tbc" ? (
              <Reveal>
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10">
                  <Clock3 className="h-7 w-7 text-brass" strokeWidth={1.4} />
                </span>
                <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light leading-tight">
                  {t.access.title}
                </h1>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-sky/75">{t.access.tbc}</p>
              </Reveal>
            ) : link ? (
              <Reveal>
                <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-leaf/40 bg-leaf/10">
                  <span className="absolute inset-0 rounded-2xl border border-gold/30 animate-pulse-ring" />
                  <Video className="h-7 w-7 text-sprout" strokeWidth={1.4} />
                </span>
                <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light leading-tight">
                  {t.access.ready}
                </h1>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-sky/75">{t.access.readyLead}</p>

                <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-sky/12 bg-sky/12 sm:grid-cols-2">
                  <div className="bg-ink/80 p-5">
                    <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-sky/50">
                      {t.access.what}
                    </dt>
                    <dd className="mt-2 text-[0.9rem] text-cream/90">{courseTitle}</dd>
                  </div>
                  <div className="bg-ink/80 p-5">
                    <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-sky/50">
                      {t.access.when}
                    </dt>
                    <dd className="mt-2 text-[0.9rem] text-cream/90">{dateFmt ?? t.access.tbc}</dd>
                  </div>
                </dl>

                <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/[0.06] p-5">
                  <p className="break-all font-mono text-[0.8rem] leading-relaxed text-brass" dir="ltr">
                    {link}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={link} target="_blank" rel="noopener noreferrer" className="btn-gold">
                    {t.access.open}
                    <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
                  </a>
                  <button type="button" onClick={copy} className="btn-outline !border-sky/25 !text-cream hover:!bg-gold hover:!text-ink">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? t.access.copied : t.access.copy}
                  </button>
                  {startsAt && courseTitle && (
                    <a
                      href={icsHref(courseTitle, startsAt, durationHours, link)}
                      download="rootsym-session.ics"
                      className="btn-outline !border-sky/25 !text-cream hover:!bg-gold hover:!text-ink"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      {t.access.addCalendar}
                    </a>
                  )}
                </div>

                <p className="mt-7 flex items-start gap-2.5 border-t border-sky/12 pt-6 text-[0.8rem] text-sky/55">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  {t.access.warning}
                </p>
              </Reveal>
            ) : (
              <Reveal>
                <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10">
                  <span className="absolute inset-0 rounded-2xl border border-gold/30 animate-pulse-ring" />
                  <Lock className="h-7 w-7 text-brass" strokeWidth={1.4} />
                </span>
                <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light leading-tight">
                  {t.access.title}
                </h1>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-sky/75">{t.access.readyLead}</p>

                {courseTitle && (
                  <p className="mt-6 font-display text-xl text-brass">{courseTitle}</p>
                )}
                {dateFmt && <p className="mt-2 text-[0.88rem] text-sky/65">{dateFmt}</p>}

                <button type="button" onClick={reveal} disabled={busy} className="btn-gold mt-9">
                  {busy ? t.common.loading : t.access.reveal}
                  {!busy && <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />}
                </button>
                <p className="mt-3 text-[0.78rem] text-brass">{t.access.revealHint}</p>

                <p className="mt-6 flex items-start gap-2.5 text-[0.8rem] text-sky/55">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" strokeWidth={1.8} />
                  {t.access.warning}
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
