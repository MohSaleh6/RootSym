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
import { siteConfig, whatsappLink } from "@/content/profile";

/** WhatsApp's own glyph — lucide dropped brand icons in v1. */
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24Z" />
    </svg>
  );
}

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

                {/* The fastest route to a confirmed seat: a transfer Rand can
                    see is a transfer she can approve, and most people would
                    rather send a message than fill in another form. */}
                <Reveal delay={220}>
                  <div className="mt-7 rounded-2xl border border-[#25D366]/35 bg-[#25D366]/8 p-5">
                    <p className="text-[0.9rem] leading-relaxed text-cream">{t.pay.whatsappLead}</p>
                    <a
                      href={whatsappLink(
                        `Hello Rand, I have paid for my RootSym seat. Booking reference ${reference}.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3 text-[0.86rem] font-bold text-white transition-transform duration-300 hover:scale-[1.03]"
                    >
                      <WhatsAppGlyph />
                      {t.pay.whatsappButton}
                    </a>
                    <p className="mt-3 text-[0.78rem] text-sky/55" dir="ltr">
                      {siteConfig.phone}
                    </p>
                  </div>
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
