"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CircleCheck, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { siteConfig } from "@/content/profile";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";

export default function ContactView() {
  const { t, locale } = useI18n();
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  // What the server said went wrong, when it says anything useful. Without
  // this the form shows one fixed sentence for every failure, which tells
  // neither the visitor nor us anything.
  const [reason, setReason] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("busy");
    setReason(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          organisation: String(data.get("organisation") || ""),
          subject: String(data.get("subject") || ""),
          message: String(data.get("message") || ""),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setReason(typeof body?.error === "string" ? body.error : null);
        setState("error");
        return;
      }
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  const cards = [
    { icon: Mail, label: t.contact.email, value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: Phone, label: t.contact.phone, value: siteConfig.phone, href: `tel:${siteConfig.phoneHref}` },
    {
      icon: MapPin,
      label: t.about.eyebrow,
      value: locale === "ar" ? siteConfig.locationAr : siteConfig.location,
      href: null,
    },
  ];

  return (
    <>
      <PageHero eyebrow={t.contact.eyebrow} title={t.contact.title} lead={t.contact.lead} compact />

      <section className="relative overflow-hidden bg-cream py-16 lg:py-24">
        <div className="blueprint pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
            <Reveal>
              <form
                onSubmit={onSubmit}
                className="rounded-[1.5rem] border border-dune bg-parchment p-7 sm:p-9"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="field-label">{t.contact.name} *</span>
                    <input name="name" required maxLength={120} className="field" autoComplete="name" />
                  </label>
                  <label>
                    <span className="field-label">{t.contact.email} *</span>
                    <input name="email" type="email" required className="field" autoComplete="email" dir="ltr" />
                  </label>
                  <label>
                    <span className="field-label">{t.contact.phone}</span>
                    <input name="phone" className="field" autoComplete="tel" dir="ltr" />
                  </label>
                  <label>
                    <span className="field-label">{t.contact.organisation}</span>
                    <input name="organisation" className="field" autoComplete="organization" />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="field-label">{t.contact.subject} *</span>
                    <input name="subject" required maxLength={160} className="field" />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="field-label">{t.contact.message} *</span>
                    <textarea name="message" required rows={6} maxLength={4000} className="field resize-y" />
                  </label>
                </div>

                {state === "sent" && (
                  <p className="mt-5 flex items-center gap-2.5 rounded-xl border border-leaf/40 bg-leaf/10 px-4 py-3 text-[0.86rem] text-abyss">
                    <CircleCheck className="h-4 w-4 shrink-0 text-moss" strokeWidth={1.9} />
                    {t.contact.sent}
                  </p>
                )}
                {state === "error" && (
                  <p className="mt-5 flex items-center gap-2.5 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-[0.86rem] text-abyss">
                    <TriangleAlert className="h-4 w-4 shrink-0 text-ember" strokeWidth={1.9} />
                    {reason ?? t.contact.error}
                  </p>
                )}

                <button type="submit" disabled={state === "busy"} className="btn-gold mt-7">
                  {state === "busy" ? t.contact.sending : t.contact.send}
                  {state !== "busy" && <Send className="h-4 w-4 flip-x" strokeWidth={2} />}
                </button>
              </form>
            </Reveal>

            <div className="space-y-4 lg:sticky lg:top-24">
              {cards.map((c, i) => (
                <Reveal key={c.label} delay={100 + i * 70}>
                  <div className="group rounded-2xl border border-dune bg-parchment p-5 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lux">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-dune bg-cream transition-transform duration-500 group-hover:scale-110">
                      <c.icon className="h-4.5 w-4.5 text-teal" strokeWidth={1.7} />
                    </span>
                    <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-ink/65">
                      {c.label}
                    </p>
                    {c.href ? (
                      <a
                        href={c.href}
                        dir="ltr"
                        className="mt-1.5 block break-all text-[0.92rem] font-medium text-abyss transition-colors hover:text-gold"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-1.5 text-[0.92rem] font-medium text-abyss">{c.value}</p>
                    )}
                  </div>
                </Reveal>
              ))}

              <Reveal delay={320}>
                <p className="rounded-2xl border border-dashed border-dune bg-sand/50 p-5 text-[0.82rem] leading-relaxed text-slate-ink">
                  {t.contact.based}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
