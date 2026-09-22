"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import Reveal from "@/components/Reveal";

/** The frame both sign-in and sign-up sit in, so the pair feel like one room. */
export default function AuthCard({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-24 text-cream">
      <div className="blueprint-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -end-24 top-10 h-[26rem] w-[26rem] rounded-full bg-tide/12 blur-[130px] animate-drift" />
      <div className="pointer-events-none absolute -start-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-gold/10 blur-[120px]" />

      <Reveal className="relative w-full max-w-md">
        <div className="rounded-[1.8rem] border border-sky/15 bg-abyss/60 p-8 backdrop-blur-xl sm:p-10">
          <Link href="/" className="mx-auto block w-fit">
            <LogoMark className="h-14 w-14" tone="light" />
          </Link>

          <h1 className="mt-7 text-center font-display text-[1.7rem] font-semibold leading-tight">
            {title}
          </h1>
          <p className="mt-2.5 text-center text-[0.88rem] leading-relaxed text-sky/65">{lead}</p>

          <div className="mt-8">{children}</div>
        </div>

        <p className="mt-6 text-center text-[0.86rem] text-sky/60">{footer}</p>
      </Reveal>
    </section>
  );
}
