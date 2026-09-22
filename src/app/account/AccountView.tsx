"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  Clock,
  CreditCard,
  LogOut,
  Ticket,
} from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { formatJod } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";

export type BookingRow = {
  id: string;
  reference: string;
  status: string;
  amount: number;
  attendees: number;
  courseTitle: string;
  courseTitleAr: string | null;
  startsAt: string | null;
  timezone: string | null;
  accessToken: string;
  accessOpenedAt: string | null;
  createdAt: string;
};

export default function AccountView({
  name,
  email,
  phone,
  organisation,
  jobTitle,
  bookings,
}: {
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  jobTitle: string | null;
  bookings: BookingRow[];
}) {
  const { t, pick, locale } = useI18n();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setSaved(false);
    await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") || ""),
        phone: String(data.get("phone") || ""),
        organisation: String(data.get("organisation") || ""),
        jobTitle: String(data.get("jobTitle") || ""),
      }),
    });
    setBusy(false);
    setSaved(true);
    router.refresh();
  }

  const label = (status: string) =>
    status === "PAID"
      ? t.account.confirmed
      : status === "AWAITING_REVIEW"
        ? t.account.awaitingReview
        : status === "CANCELLED"
          ? t.account.cancelled
          : status === "REFUNDED"
            ? t.account.refunded
            : t.account.awaitingPayment;

  const tone = (status: string) =>
    status === "PAID"
      ? "border-teal/35 bg-teal/10 text-teal"
      : status === "AWAITING_REVIEW"
        ? "border-gold/45 bg-gold/10 text-brass"
        : status === "CANCELLED" || status === "REFUNDED"
          ? "border-dune bg-sand text-slate-ink"
          : "border-ember/35 bg-ember/8 text-ember";

  return (
    <>
      <PageHero eyebrow={t.account.eyebrow} title={t.account.title} lead={t.account.lead} compact>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="rounded-full border border-sky/20 px-4 py-2 text-[0.82rem] text-sky/75" dir="ltr">
            {email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 text-[0.82rem] font-semibold text-sky/60 transition-colors hover:text-brass"
          >
            <LogOut className="h-4 w-4 flip-x" strokeWidth={1.8} />
            {t.auth.signOut}
          </button>
        </div>
      </PageHero>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          {bookings.length === 0 ? (
            <Reveal>
              <div className="rounded-[1.6rem] border border-dune bg-parchment p-12 text-center">
                <Ticket className="mx-auto h-10 w-10 text-teal/50" strokeWidth={1.4} />
                <p className="mt-5 text-[1.05rem] text-slate-ink">{t.account.empty}</p>
                <Link href="/courses" className="btn-gold mt-7">
                  {t.account.browse}
                  <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="space-y-4">
              {bookings.map((b, i) => (
                <Reveal key={b.id} delay={i * 60}>
                  <article className="rounded-[1.5rem] border border-dune bg-parchment p-6 transition-all duration-400 hover:border-gold/40 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-display text-[1.3rem] font-semibold leading-snug text-abyss">
                          {pick(b.courseTitle, b.courseTitleAr)}
                        </h2>
                        <p className="mt-2 text-[0.82rem] uppercase tracking-[0.16em] text-slate-ink/70">
                          {t.account.reference} <span dir="ltr">{b.reference}</span>
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-4 py-1.5 text-[0.78rem] font-semibold ${tone(b.status)}`}
                      >
                        {label(b.status)}
                      </span>
                    </div>

                    <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                      {b.startsAt && (
                        <div className="flex items-start gap-2.5">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={1.7} />
                          <div>
                            <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-ink/60">
                              {t.course.upcoming}
                            </dt>
                            <dd className="mt-1 text-[0.88rem] text-abyss">
                              {formatDateTime(b.startsAt, b.timezone ?? "Asia/Amman", locale)}
                            </dd>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={1.7} />
                        <div>
                          <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-ink/60">
                            {t.account.amount}
                          </dt>
                          <dd className="mt-1 text-[0.88rem] text-abyss">{formatJod(b.amount)}</dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={1.7} />
                        <div>
                          <dt className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-ink/60">
                            {t.account.status}
                          </dt>
                          <dd className="mt-1 text-[0.88rem] text-abyss">{label(b.status)}</dd>
                        </div>
                      </div>
                    </dl>

                    <div className="mt-7 flex flex-wrap gap-3">
                      {b.status === "PAID" ? (
                        <Link href={`/access/${b.accessToken}`} className="btn-gold !py-3 !text-[0.84rem]">
                          <CircleCheck className="h-4 w-4" strokeWidth={2} />
                          {t.account.openJoining}
                        </Link>
                      ) : (
                        b.status !== "CANCELLED" &&
                        b.status !== "REFUNDED" && (
                          <Link
                            href={`/checkout/confirm/${b.accessToken}`}
                            className="btn-gold !py-3 !text-[0.84rem]"
                          >
                            {t.account.paymentPage}
                            <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
                          </Link>
                        )
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={120}>
            <form
              onSubmit={saveProfile}
              className="mt-12 rounded-[1.5rem] border border-dune bg-parchment p-6 sm:p-8"
            >
              <h2 className="font-display text-[1.2rem] font-semibold text-abyss">
                {t.account.profile}
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="acc-name" className="field-label">
                    {t.auth.name}
                  </label>
                  <input id="acc-name" name="name" defaultValue={name} required className="field" />
                </div>
                <div>
                  <label htmlFor="acc-phone" className="field-label">
                    {t.auth.phone}
                  </label>
                  <input id="acc-phone" name="phone" defaultValue={phone ?? ""} className="field" dir="ltr" />
                </div>
                <div>
                  <label htmlFor="acc-org" className="field-label">
                    {t.auth.organisation}
                  </label>
                  <input
                    id="acc-org"
                    name="organisation"
                    defaultValue={organisation ?? ""}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="acc-job" className="field-label">
                    {t.auth.jobTitle}
                  </label>
                  <input id="acc-job" name="jobTitle" defaultValue={jobTitle ?? ""} className="field" />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button type="submit" disabled={busy} className="btn-gold !py-3 !text-[0.84rem]">
                  {busy ? t.auth.working : t.account.save}
                </button>
                {saved && (
                  <span className="inline-flex items-center gap-2 text-[0.84rem] text-teal">
                    <CircleCheck className="h-4 w-4" strokeWidth={2} />
                    {t.account.saved}
                  </span>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
