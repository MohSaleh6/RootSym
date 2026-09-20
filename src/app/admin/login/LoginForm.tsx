"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, TriangleAlert } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") || ""),
          password: String(data.get("password") || ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Wrong email or password.");
        setBusy(false);
        return;
      }
      router.replace(params.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-16">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute start-1/2 top-1/3 h-[26rem] w-[36rem] -translate-x-1/2 rounded-full bg-tide/12 blur-[130px] animate-drift" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-16 w-16" tone="light" />
          <h1 className="mt-5 font-display text-3xl font-semibold text-cream">RootSym</h1>
          <p className="mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-brass">
            Admin
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-9 rounded-[1.4rem] border border-sky/15 bg-white/[0.03] p-7 backdrop-blur-xl"
        >
          <label className="block">
            <span className="field-label !text-sky/60">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              dir="ltr"
              className="field !border-sky/20 !bg-ink/60 !text-cream placeholder:!text-sky/40"
            />
          </label>

          <label className="mt-4 block">
            <span className="field-label !text-sky/60">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              dir="ltr"
              className="field !border-sky/20 !bg-ink/60 !text-cream placeholder:!text-sky/40"
            />
          </label>

          {error && (
            <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-[0.82rem] text-cream">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-flame" strokeWidth={1.9} />
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-gold mt-6 w-full">
            {busy ? "Signing in…" : "Sign in"}
            {!busy && <ArrowRight className="h-4 w-4 flip-x" strokeWidth={2} />}
          </button>

          <p className="mt-5 flex items-start gap-2 text-[0.72rem] leading-relaxed text-sky/50">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
            Credentials are set through the ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
          </p>
        </form>
      </div>
    </div>
  );
}
