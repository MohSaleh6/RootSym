"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, Stethoscope } from "lucide-react";

/**
 * The admin panel's own boundary. Unlike the public one it names the error,
 * because the only person who sees it is the one who can fix it — and it
 * points at the readiness page, which turns "something failed" into the
 * specific setting that is wrong.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] unhandled error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-abyss">
        This page could not load.
      </h1>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-slate-ink">
        Most often the database was still waking up. If it keeps happening, Readiness will name
        the cause.
      </p>

      <pre className="mt-6 overflow-x-auto rounded-xl border border-dune bg-parchment p-4 text-start text-[0.78rem] text-slate-ink">
        {error.message || "No message was attached to the error."}
      </pre>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-gold !py-3">
          Try again
          <RotateCw className="h-4 w-4" strokeWidth={2} />
        </button>
        <Link
          href="/admin/health"
          className="inline-flex items-center gap-2 rounded-full border border-dune px-6 py-3 text-sm font-semibold text-abyss transition-colors hover:border-teal/50"
        >
          <Stethoscope className="h-4 w-4" strokeWidth={1.8} />
          Readiness
        </Link>
      </div>
    </div>
  );
}
