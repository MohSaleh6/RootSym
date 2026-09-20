import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 text-cream">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute start-1/2 top-1/2 h-[26rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tide/12 blur-[130px] animate-drift" />

      <div className="relative max-w-md text-center">
        <LogoMark className="mx-auto h-16 w-16" tone="light" />
        <p className="mt-8 font-display text-7xl font-light gold-text">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">This page has no root.</h1>
        <p className="mt-3 text-[0.94rem] leading-relaxed text-sky/70">
          The link you followed does not point anywhere on RootSym. Let&apos;s get you back to
          something useful.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-gold">
            Back to RootSym
            <ArrowUpRight className="h-4 w-4 flip-x" strokeWidth={2} />
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full border border-sky/25 px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:border-gold/60 hover:bg-gold/8"
          >
            Browse workshops
          </Link>
        </div>
      </div>
    </div>
  );
}
