"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import AuthCard from "@/components/AuthCard";
import GoogleButton from "@/components/GoogleButton";

export default function SignInView({
  next,
  google,
  errorCode,
}: {
  next: string;
  google: boolean;
  errorCode: string | null;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // An error carried back from the Google round trip, translated here rather
  // than in the callback, which has no locale of its own.
  const fromGoogle =
    errorCode === "google-unavailable"
      ? t.auth.googleUnavailable
      : errorCode === "google-cancelled"
        ? t.auth.googleCancelled
        : errorCode === "google-state"
          ? t.auth.googleState
          : errorCode === "google-unverified"
            ? t.auth.googleUnverified
            : errorCode
              ? t.auth.googleFailed
              : null;

  const [error, setError] = useState<string | null>(fromGoogle);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") || ""),
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
      title={t.auth.signInTitle}
      lead={t.auth.signInLead}
      footer={
        <>
          {t.auth.noAccount}{" "}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="font-semibold text-brass underline underline-offset-4"
          >
            {t.auth.signUp}
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
          <label htmlFor="email" className="field-label !text-sky/55">
            {t.auth.email}
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" dir="ltr" />
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
            autoComplete="current-password"
            className="field"
            dir="ltr"
          />
        </div>

        {error && (
          <p className="flex items-start gap-2.5 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-[0.84rem] text-cream">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-flame" strokeWidth={1.9} />
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-gold !w-full !justify-center">
          {busy ? t.auth.working : t.auth.signIn}
          {!busy && <ArrowRight className="h-4 w-4 flip-x" strokeWidth={2} />}
        </button>
      </form>
    </AuthCard>
  );
}
