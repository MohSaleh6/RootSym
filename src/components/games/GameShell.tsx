"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function GameShell({
  id,
  index,
  title,
  desc,
  accent,
  children,
  score,
  total,
  onRestart,
  toolbar,
}: {
  id: string;
  index: number;
  title: string;
  desc: string;
  accent: string;
  children: ReactNode;
  score?: number;
  total?: number;
  onRestart?: () => void;
  toolbar?: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-[1.6rem] border border-dune bg-parchment shadow-[0_30px_80px_-65px_rgba(7,30,41,.6)]"
    >
      <header className="relative overflow-hidden bg-ink px-6 py-6 text-cream sm:px-8">
        <div className="blueprint-dark absolute inset-0 opacity-60" />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-[70px]"
          style={{ background: `${accent}44` }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[0.66rem] tracking-[0.2em]" style={{ color: accent }}>
              {String(index).padStart(2, "0")}
            </span>
            <h2 className="mt-1.5 font-display text-[1.6rem] font-semibold leading-tight">{title}</h2>
            <p className="mt-1.5 max-w-xl text-[0.85rem] leading-relaxed text-sky/70">{desc}</p>
          </div>
          <div className="flex items-center gap-3">
            {toolbar}
            {typeof score === "number" && typeof total === "number" && (
              <span className="rounded-full border border-sky/20 bg-white/5 px-4 py-2 text-[0.75rem] font-semibold text-brass">
                {t.playground.score} {score}/{total}
              </span>
            )}
            {onRestart && (
              <button
                type="button"
                onClick={onRestart}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky/20 text-cream transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink"
                aria-label={t.playground.restart}
                title={t.playground.restart}
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.9} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}

export function ProgressDots({ total, current, accent }: { total: number; current: number; accent: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: i === current ? 26 : 10,
            background: i < current ? accent : i === current ? accent : "#e4d9bd",
            opacity: i <= current ? 1 : 0.6,
          }}
        />
      ))}
    </div>
  );
}
