"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Check,
  CircleCheck,
  Clock3,
  Copy,
  Hourglass,
  Send,
  TriangleAlert,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatJod } from "@/lib/money";
import Reveal from "@/components/Reveal";
import { LogoMark } from "@/components/Logo";

export type ConfirmState = "awaiting" | "under_review" | "paid" | "not_found" | "cancelled";

type Row = { label: string; labelAr: string; value: string; copyable: boolean };

type Props = {
  token: string;
  state: ConfirmState;
  reference: string | null;
  courseTitle: string | null;
  amountFils: number | null;
  rows: Row[];
  notes: string;
  notesAr: string;
  holdExpiresAt: string | null;
  accessPath: string | null;
};

function useCountdown(iso: string | null) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!iso) return;
    const target = new Date(iso).getTime();
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [iso]);

  return left;
}

export default function ConfirmView({
  token,
  state,
  reference,
  courseTitle,
  amountFils,
  rows,
  notes,
  notesAr,
  holdExpiresAt,
  accessPath,
}: Props) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const [status, setStatus] = useState<ConfirmState>(state);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const left = useCountdown(holdExpiresAt);
  const expired = left !== null && left <= 0;

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard can be blocked — the value is on screen anyway */
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch(`/api/checkout/confirm/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferReference: String(data.get("transferReference") || ""),
          transferNote: String(data.get("transferNote") || ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || t.pay.error);
        setBusy(false);
        return;
      }
      setStatus(json.state === "already_paid" ? "paid" : "under_review");
      setBusy(false);
    } catch {
      setError(t.pay.error);
      setBusy(false);
    }
  }

  const countdown = (() => {
    if (left === null || left <= 0) return null;
    const num = new Intl.NumberFormat(isAr ? "ar-JO" : "en");
    const hours = Math.floor(left / 3600_000);
    const minutes = Math.floor((left % 3600_000) / 60_000);
    return `${num.format(hours)}${t.pay.hours} ${num.format(minutes)}${t.pay.minutes}`;
  })();

  return (
    <section className="relative min-h-screen overflow-hidden bg-ink py-28 text-cream">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute start-1/2 top-1/4 h-[30rem] w-[42rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px] animate-drift" />

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

        <div className="mt-9 overflow-hidden rounded-[1.7rem] border border-sky/15 bg-gradient-to-br from-deep/45 to-ink/80 p-1.5 backdrop-blur-xl">
          <div className="rounded-[1.45rem] border border-sky/10 bg-ink/50 p-7 sm:p-9">
            {status === "not_found" && (
              <Reveal>
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-ember/35 bg-ember/10">
                  <TriangleAlert className="h-7 w-7 text-flame" strokeWidth={1.4} />
                </span>
                <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light">
                  {t.pay.notFound}
                </h1>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-sky/75">{t.pay.notFoundLead}</p>
              </Reveal>
            )}

            {status === "cancelled" && (
              <Reveal>
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-ember/35 bg-ember/10">
                  <TriangleAlert className="h-7 w-7 text-flame" strokeWidth={1.4} />
                </span>
                <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light">
                  {t.pay.cancelled}
                </h1>
                <Link href="/contact" className="btn-gold mt-7">
                  {t.contact.title}
                  <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
                </Link>
              </Reveal>
            )}

            {status === "paid" && (
              <Reveal>
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-leaf/40 bg-leaf/10">
                  <CircleCheck className="h-7 w-7 text-sprout" strokeWidth={1.4} />
                </span>
                <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light">
                  {t.pay.alreadyPaid}
                </h1>
                {courseTitle && <p className="mt-4 font-display text-xl text-brass">{courseTitle}</p>}
                {accessPath && (
                  <Link href={accessPath} className="btn-gold mt-7">
                    {t.pay.openAccess}
                    <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
                  </Link>
                )}
              </Reveal>
            )}

            {status === "under_review" && (
              <Reveal>
                <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10">
                  <span className="absolute inset-0 rounded-2xl border border-gold/30 animate-pulse-ring" />
                  <Hourglass className="h-7 w-7 text-brass" strokeWidth={1.4} />
                </span>
                <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light">
                  {t.pay.submittedTitle}
                </h1>
                <p className="mt-4 text-[0.96rem] leading-relaxed text-sky/75">{t.pay.submittedBody}</p>
                {reference && (
                  <p className="mt-7 inline-flex items-center gap-3 rounded-xl border border-sky/20 bg-white/[0.04] px-4 py-3">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-sky/55">
                      {t.success.reference}
                    </span>
                    <span className="font-mono text-base text-cream" dir="ltr">
                      {reference}
                    </span>
                  </p>
                )}
                <Link href="/" className="btn-outline mt-8 !border-sky/25 !text-cream hover:!bg-gold hover:!text-ink">
                  {t.success.backHome}
                </Link>
              </Reveal>
            )}

            {status === "awaiting" && (
              <>
                <Reveal>
                  <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10">
                    <Banknote className="h-7 w-7 text-brass" strokeWidth={1.4} />
                  </span>
                  <h1 className="mt-7 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light leading-tight">
                    {t.pay.title}
                  </h1>
                  <p className="mt-4 text-[0.96rem] leading-relaxed text-sky/75">{t.pay.lead}</p>
                </Reveal>

                {/* amount + reference */}
                <Reveal delay={80}>
                  <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-sky/12 bg-sky/12 sm:grid-cols-2">
                    <div className="bg-ink/80 p-5">
                      <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-sky/50">
                        {t.pay.amountDue}
                      </dt>
                      <dd className="mt-2 font-display text-3xl font-semibold text-cream">
                        {amountFils === null ? "—" : formatJod(amountFils, locale)}
                      </dd>
                    </div>
                    <div className="bg-ink/80 p-5">
                      <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-sky/50">
                        {t.pay.reference}
                      </dt>
                      <dd className="mt-2 flex items-center gap-2.5">
                        <span className="font-mono text-xl font-semibold text-brass" dir="ltr">
                          {reference}
                        </span>
                        {reference && (
                          <button
                            type="button"
                            onClick={() => copy(reference, "ref")}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-sky/25 text-sky/70 transition-colors hover:border-gold hover:text-gold"
                            aria-label={t.access.copy}
                          >
                            {copied === "ref" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </dd>
                    </div>
                  </dl>
                </Reveal>

                {/* hold countdown */}
                <Reveal delay={120}>
                  <p
                    className={`mt-5 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[0.84rem] ${
                      expired
                        ? "border-ember/40 bg-ember/10 text-cream/85"
                        : "border-sky/20 bg-white/[0.04] text-sky/80"
                    }`}
                  >
                    <Clock3 className="h-4 w-4 shrink-0 text-brass" strokeWidth={1.8} />
                    {expired ? t.pay.expired : `${t.pay.held} · ${t.pay.timeLeft} ${countdown ?? "…"}`}
                  </p>
                </Reveal>

                {/* where to send it */}
                <Reveal delay={160}>
                  <div className="mt-8">
                    <h2 className="eyebrow text-brass">{t.pay.how}</h2>
                    {rows.length === 0 ? (
                      <p className="mt-4 rounded-xl border border-gold/30 bg-gold/[0.06] px-4 py-4 text-[0.88rem] leading-relaxed text-sky/80">
                        {t.pay.noDetails}
                      </p>
                    ) : (
                      <ul className="mt-4 divide-y divide-sky/10 overflow-hidden rounded-2xl border border-sky/15 bg-white/[0.03]">
                        {rows.map((row, i) => (
                          <li key={i} className="flex items-center justify-between gap-4 px-5 py-3.5">
                            <span className="text-[0.76rem] text-sky/60">
                              {isAr ? row.labelAr : row.label}
                            </span>
                            <span className="flex items-center gap-2.5">
                              <span className="font-mono text-[0.9rem] font-semibold text-cream" dir="ltr">
                                {row.value}
                              </span>
                              {row.copyable && (
                                <button
                                  type="button"
                                  onClick={() => copy(row.value, `row-${i}`)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-sky/25 text-sky/70 transition-colors hover:border-gold hover:text-gold"
                                  aria-label={t.access.copy}
                                >
                                  {copied === `row-${i}` ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {(isAr ? notesAr || notes : notes) && (
                      <p className="mt-4 whitespace-pre-line text-[0.84rem] leading-relaxed text-sky/60">
                        {isAr ? notesAr || notes : notes}
                      </p>
                    )}
                  </div>
                </Reveal>

                {/* I have paid */}
                <Reveal delay={200}>
                  <form onSubmit={submit} className="mt-9 border-t border-sky/12 pt-7">
                    <h2 className="eyebrow text-brass">{t.pay.didPay}</h2>

                    <label className="mt-4 block">
                      <span className="field-label !text-sky/60">{t.pay.transferRef} *</span>
                      <input
                        name="transferReference"
                        required
                        maxLength={200}
                        dir="ltr"
                        className="field !border-sky/20 !bg-ink/60 !text-cream placeholder:!text-sky/40"
                      />
                      <span className="mt-1.5 block text-[0.72rem] text-sky/50">
                        {t.pay.transferRefHint}
                      </span>
                    </label>

                    <label className="mt-4 block">
                      <span className="field-label !text-sky/60">{t.pay.transferNote}</span>
                      <textarea
                        name="transferNote"
                        rows={3}
                        maxLength={1000}
                        className="field resize-y !border-sky/20 !bg-ink/60 !text-cream placeholder:!text-sky/40"
                      />
                    </label>

                    {error && (
                      <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-[0.84rem] text-cream">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-flame" strokeWidth={1.9} />
                        {error}
                      </p>
                    )}

                    <button type="submit" disabled={busy} className="btn-gold mt-6">
                      {busy ? t.pay.submitting : t.pay.submit}
                      {!busy && <Send className="h-4 w-4 flip-x" strokeWidth={2} />}
                    </button>
                  </form>
                </Reveal>

                <Reveal delay={240}>
                  <p className="mt-7 text-[0.78rem] text-sky/50">{t.pay.keepPage}</p>
                </Reveal>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
