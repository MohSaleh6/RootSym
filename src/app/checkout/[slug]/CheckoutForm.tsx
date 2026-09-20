"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  CreditCard,
  Lock,
  User,
  Check,
  TriangleAlert,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatJod } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import type { CourseDTO } from "@/lib/courses";
import Reveal from "@/components/Reveal";

type Props = { course: CourseDTO; stripeReady: boolean };

export default function CheckoutForm({ course, stripeReady }: Props) {
  const { t, pick, fill, locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();

  const initialType = params.get("type") === "company" ? "COMPANY" : "INDIVIDUAL";
  const [type, setType] = useState<"INDIVIDUAL" | "COMPANY">(initialType);
  const [attendees, setAttendees] = useState(initialType === "COMPANY" ? course.maxAttendees : 1);
  const [method, setMethod] = useState<"STRIPE" | "BANK_TRANSFER">(
    stripeReady ? "STRIPE" : "BANK_TRANSFER",
  );
  const [sessionId, setSessionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelled = params.get("cancelled") === "1";

  const total = useMemo(
    () => (type === "COMPANY" ? course.priceCompany : course.priceIndividual * attendees),
    [type, attendees, course.priceCompany, course.priceIndividual],
  );



  function switchType(next: "INDIVIDUAL" | "COMPANY") {
    setType(next);
    setAttendees(next === "COMPANY" ? course.maxAttendees : 1);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    const body = {
      slug: course.slug,
      type,
      fullName: String(form.get("fullName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      organisation: String(form.get("organisation") || ""),
      jobTitle: String(form.get("jobTitle") || ""),
      attendees,
      sessionId,
      message: String(form.get("message") || ""),
      paymentMethod: method,
    };

    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || t.checkout.errorGeneric);
        setBusy(false);
        return;
      }
      if (data.mode === "stripe" && data.url) {
        window.location.assign(data.url);
        return;
      }
      router.push(data.redirect || "/checkout/success");
    } catch {
      setError(t.checkout.errorGeneric);
      setBusy(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-cream pb-24 pt-32">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-10 h-[22rem] w-[22rem] rounded-full bg-tide/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 text-[0.78rem] font-semibold text-slate-ink transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5 flip-x" strokeWidth={2} />
            {pick(course.title, course.titleAr)}
          </Link>
        </Reveal>

        <Reveal delay={70}>
          <h1 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.2rem)] font-light leading-[1.06] text-abyss">
            {t.checkout.title}
          </h1>
          <p className="mt-3 text-[0.96rem] text-slate-ink">{t.checkout.lead}</p>
        </Reveal>

        {cancelled && (
          <Reveal delay={90}>
            <p className="mt-6 flex items-center gap-3 rounded-2xl border border-ember/35 bg-ember/8 px-5 py-4 text-[0.88rem] text-abyss">
              <TriangleAlert className="h-4 w-4 shrink-0 text-ember" strokeWidth={1.8} />
              {t.checkout.errorGeneric}
            </p>
          </Reveal>
        )}

        <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
          {/* ---------- form ---------- */}
          <div className="space-y-6">
            {/* booking type */}
            <Reveal delay={100}>
              <fieldset className="rounded-[1.4rem] border border-dune bg-parchment p-6">
                <legend className="field-label !mb-0 px-2">{t.checkout.type}</legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { key: "INDIVIDUAL", label: t.checkout.individual, desc: t.course.individualDesc, icon: User, price: course.priceIndividual },
                      { key: "COMPANY", label: t.checkout.company, desc: t.course.companyDesc, icon: Building2, price: course.priceCompany },
                    ] as const
                  ).map((opt) => {
                    const active = type === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => switchType(opt.key)}
                        aria-pressed={active}
                        className={`group relative overflow-hidden rounded-2xl border p-5 text-start transition-all duration-400 ${
                          active
                            ? "border-gold bg-gold/10 shadow-gold"
                            : "border-dune bg-cream hover:border-teal/40"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-2.5 font-display text-lg font-semibold text-abyss">
                            <opt.icon className="h-4.5 w-4.5 text-teal" strokeWidth={1.7} />
                            {opt.label}
                          </span>
                          {active && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                              <Check className="h-3 w-3 text-ink" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                        <span className="mt-2 block font-display text-xl text-abyss">
                          {formatJod(opt.price, locale)}
                        </span>
                        <span className="mt-1.5 block text-[0.78rem] leading-relaxed text-slate-ink">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </Reveal>

            {/* details */}
            <Reveal delay={160}>
              <fieldset className="rounded-[1.4rem] border border-dune bg-parchment p-6">
                <legend className="field-label !mb-0 px-2">{t.checkout.details}</legend>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="field-label">{t.checkout.fullName} *</span>
                    <input name="fullName" required maxLength={120} className="field" autoComplete="name" />
                  </label>
                  <label>
                    <span className="field-label">{t.checkout.email} *</span>
                    <input name="email" type="email" required className="field" autoComplete="email" dir="ltr" />
                  </label>
                  <label>
                    <span className="field-label">{t.checkout.phone}</span>
                    <input name="phone" className="field" autoComplete="tel" dir="ltr" />
                  </label>
                  <label>
                    <span className="field-label">
                      {t.checkout.organisation}
                      {type === "COMPANY" ? " *" : ""}
                    </span>
                    <input
                      name="organisation"
                      required={type === "COMPANY"}
                      className="field"
                      autoComplete="organization"
                    />
                  </label>
                  <label>
                    <span className="field-label">{t.checkout.jobTitle}</span>
                    <input name="jobTitle" className="field" autoComplete="organization-title" />
                  </label>

                  <label>
                    <span className="field-label">{t.checkout.attendees}</span>
                    <input
                      type="number"
                      min={1}
                      max={course.maxAttendees}
                      value={attendees}
                      onChange={(e) =>
                        setAttendees(
                          Math.min(course.maxAttendees, Math.max(1, Number(e.target.value) || 1)),
                        )
                      }
                      className="field"
                    />
                    <span className="mt-1.5 block text-[0.72rem] text-slate-ink/70">
                      {fill(t.checkout.attendeesHint, { n: course.maxAttendees })}
                    </span>
                  </label>

                  <label>
                    <span className="field-label">{t.checkout.session}</span>
                    <select
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      className="field"
                    >
                      <option value="">{t.checkout.anySession}</option>
                      {course.sessions.map((s) => (
                        <option key={s.id} value={s.id} disabled={s.seatsLeft <= 0}>
                          {formatDateTime(s.startsAt, s.timezone, locale)} — {s.seatsLeft}/{s.seatsTotal}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sm:col-span-2">
                    <span className="field-label">{t.checkout.message}</span>
                    <textarea name="message" rows={4} maxLength={2000} className="field resize-y" />
                    <span className="mt-1.5 block text-[0.72rem] text-slate-ink/70">
                      {t.checkout.messageHint}
                    </span>
                  </label>
                </div>
              </fieldset>
            </Reveal>

            {/* payment */}
            <Reveal delay={220}>
              <fieldset className="rounded-[1.4rem] border border-dune bg-parchment p-6">
                <legend className="field-label !mb-0 px-2">{t.checkout.payment}</legend>

                {stripeReady ? (
                  <div className="mt-4 space-y-3">
                    {(
                      [
                        {
                          key: "STRIPE" as const,
                          label: t.checkout.payCard,
                          desc: t.checkout.payCardDesc,
                          icon: CreditCard,
                        },
                        {
                          key: "BANK_TRANSFER" as const,
                          label: t.checkout.payTransfer,
                          desc: t.checkout.payTransferDesc,
                          icon: Banknote,
                        },
                      ]
                    ).map((opt) => {
                      const active = method === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setMethod(opt.key)}
                          aria-pressed={active}
                          className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-start transition-all duration-400 ${
                            active ? "border-gold bg-gold/10" : "border-dune bg-cream hover:border-teal/40"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              active ? "bg-gold text-ink" : "bg-sand text-teal"
                            }`}
                          >
                            <opt.icon className="h-4 w-4" strokeWidth={1.8} />
                          </span>
                          <span>
                            <span className="block font-semibold text-abyss">{opt.label}</span>
                            <span className="mt-1 block text-[0.8rem] leading-relaxed text-slate-ink">
                              {opt.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Cards are not configured — there is only one way to pay, so
                     present it as a fact rather than a disabled choice. */
                  <div className="mt-4 flex items-start gap-4 rounded-2xl border border-gold/45 bg-gold/8 p-5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold text-ink">
                      <Banknote className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className="block font-semibold text-abyss">{t.checkout.payOnlyTitle}</span>
                      <span className="mt-1 block text-[0.84rem] leading-relaxed text-slate-ink">
                        {t.checkout.payOnlyDesc}
                      </span>
                    </span>
                  </div>
                )}
              </fieldset>
            </Reveal>
          </div>

          {/* ---------- summary ---------- */}
          <Reveal delay={260}>
            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[1.4rem] border border-dune bg-parchment shadow-[0_30px_80px_-60px_rgba(7,30,41,.6)]">
                <div className="relative bg-ink p-5 text-cream">
                  <div className="blueprint-dark absolute inset-0 opacity-60" />
                  <p className="relative font-display text-lg leading-snug">
                    {pick(course.title, course.titleAr)}
                  </p>
                  <p className="relative mt-1.5 text-[0.75rem] text-sky/70">
                    {fill(t.courses.hours, { n: course.durationHours })} · {course.deliveryMode}
                  </p>
                </div>

                <dl className="space-y-3 p-5 text-[0.85rem]">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-ink">{t.checkout.type}</dt>
                    <dd className="font-semibold text-abyss">
                      {type === "COMPANY" ? t.checkout.company : t.checkout.individual}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-ink">{t.checkout.attendees}</dt>
                    <dd className="font-semibold text-abyss">{attendees}</dd>
                  </div>
                  {type === "COMPANY" && (
                    <p className="text-[0.74rem] leading-relaxed text-slate-ink/75">
                      {fill(t.checkout.seatsLine, { n: attendees })}
                    </p>
                  )}
                </dl>

                <div className="border-t border-dune p-5">
                  <div className="flex items-end justify-between gap-3">
                    <span className="field-label !mb-0">{t.checkout.total}</span>
                    <span className="font-display text-3xl font-semibold text-abyss">
                      {formatJod(total, locale)}
                    </span>
                  </div>

                  {error && (
                    <p className="mt-4 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-[0.8rem] text-abyss">
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={busy} className="btn-gold mt-5 w-full">
                    {busy ? t.checkout.submitting : t.checkout.submit}
                    {!busy && <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />}
                  </button>

                  <p className="mt-4 flex items-start gap-2 text-[0.7rem] leading-relaxed text-slate-ink/70">
                    <Lock className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
                    {t.checkout.agree}
                  </p>
                </div>
              </div>
            </aside>
          </Reveal>
        </form>
      </div>
    </section>
  );
}
