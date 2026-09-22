"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/Logo";

/**
 * The last line of defence for the public site.
 *
 * Without this, anything a page throws — most often the database still waking
 * from suspend — escapes the Worker and the visitor gets Cloudflare's raw
 * "Error 1101", which says nothing, carries no branding and offers no way
 * back. The database layer already retries a sleeping connection, so reaching
 * this page means something rarer went wrong; it stays calm about it and
 * gives the one action that usually works.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 text-cream">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute start-1/2 top-1/2 h-[26rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/10 blur-[130px] animate-drift" />

      <div className="relative max-w-md text-center">
        <LogoMark className="mx-auto h-16 w-16" tone="light" />
        <h1 className="mt-8 font-display text-2xl font-semibold">
          Something on our side stalled.
        </h1>
        <p className="mt-3 text-[0.94rem] leading-relaxed text-sky/70">
          This is us, not you, and it is usually over in a moment. Try again — and if it keeps
          happening, write to us and we will sort it out.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-gold">
            Try again
            <RotateCw className="h-4 w-4" strokeWidth={2} />
          </button>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-sky/25 px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
          >
            Contact us
            <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[0.7rem] uppercase tracking-[0.2em] text-sky/30">
            Reference {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
