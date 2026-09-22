"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import AuthCard from "@/components/AuthCard";
import GoogleButton from "@/components/GoogleButton";

export default function SignUpView({ next, google }: { next: string; google: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          organisation: String(data.get("organisation") || ""),
          jobTitle: String(data.get("jobTitle") || ""),
          password: String(data.get("password") || ""),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(typeof body?.error === "string" ? body.error : t.auth.genericError);
        setBusy(false);
        return;
      }
      router.push(next || "/account");
      router.refresh();
    } catch {
      setError(t.auth.genericError);
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title={t.auth.signUpTitle}
      lead={t.auth.signUpLead}
      footer={
        <>
          {t.auth.haveAccount}{" "}
          <Link
            href={next ? `/signin?next=${encodeURIComponent(next)}` : "/signin"}
            className="font-semibold text-brass underline underline-offset-4"
          >
            {t.auth.signIn}
          </Link>
        </>
      }
    >
      {google && (
        <>
          <GoogleButton next={next} />
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-sky/15" />
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-sky/40">
              {t.auth.or}
            </span>
            <span className="h-px flex-1 bg-sky/15" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
        <div>
          <label htmlFor="name" className="field-label !text-sky/55">
            {t.auth.name}
          </label>
          <input id="name" name="name" required autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="email" className="field-label !text-sky/55">
            {t.auth.email}
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" dir="ltr" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="field-label !text-sky/55">
              {t.auth.phone}
            </label>
            <input id="phone" name="phone" autoComplete="tel" className="field" dir="ltr" />
          </div>
          <div>
            <label htmlFor="organisation" className="field-label !text-sky/55">
              {t.auth.organisation}
            </label>
            <input id="organisation" name="organisation" autoComplete="organization" className="field" />
          </div>
        </div>
        <div>
          <label htmlFor="jobTitle" className="field-label !text-sky/55">
            {t.auth.jobTitle}
          </label>
          <input id="jobTitle" name="jobTitle" autoComplete="organization-title" className="field" />
        </div>
        <div>
          <label htmlFor="password" className="field-label !text-sky/55">
            {t.auth.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="field"
            dir="ltr"
          />
          <p className="mt-1.5 text-[0.76rem] text-sky/45">{t.auth.passwordHint}</p>
        </div>

        {error && (
          <p className="flex items-start gap-2.5 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-[0.84rem] text-cream">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-flame" strokeWidth={1.9} />
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-gold !w-full !justify-center">
          {busy ? t.auth.working : t.auth.signUp}
          {!busy && <ArrowRight className="h-4 w-4 flip-x" strokeWidth={2} />}
        </button>
      </form>
    </AuthCard>
  );
}
