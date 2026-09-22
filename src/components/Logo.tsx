"use client";

import Image from "next/image";

/**
 * The RootSym mark.
 *
 * This is Rand's artwork itself, not a redrawing of it — the emblem lifted
 * off its cream plate so it can sit on any surface. Because it is a bitmap,
 * the motion lives around it rather than inside it: two counter-rotating
 * arcs, drawn in the brand's gold and teal, orbit the mark while the mark
 * itself breathes. The effect reads as the same mechanism the logo depicts,
 * and it costs the logo nothing in fidelity.
 *
 * On dark surfaces the emblem sits on a soft plate, because its darkest
 * strokes are near-navy and would otherwise disappear into the background.
 */

export function LogoMark({
  className = "h-10 w-10",
  animated = true,
  tone = "dark",
}: {
  className?: string;
  animated?: boolean;
  /** "dark" = for light backgrounds, "light" = for dark backgrounds */
  tone?: "dark" | "light";
}) {
  const onDark = tone === "light";

  return (
    <span className={`relative inline-block shrink-0 ${className}`} aria-hidden={false}>
      {onDark && (
        <span className="absolute inset-[12%] rounded-full bg-cream/94 ring-1 ring-gold/25" />
      )}

      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* gold arc, clockwise */}
        <g className={animated ? "origin-center animate-spin-slow" : "origin-center"}>
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={onDark ? "#dcb75a" : "#c9a227"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="52 200"
            opacity={onDark ? 0.9 : 0.75}
          />
        </g>
        {/* teal arc, the other way */}
        <g className={animated ? "origin-center animate-spin-slower" : "origin-center"}>
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={onDark ? "#6bb3cf" : "#2e86ab"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="22 112"
            opacity="0.6"
          />
        </g>
      </svg>

      <Image
        src="/brand/rootsym-mark.webp"
        alt="RootSym"
        width={320}
        height={320}
        unoptimized
        priority
        className={`absolute inset-[14%] h-[72%] w-[72%] object-contain ${
          animated ? "animate-float" : ""
        }`}
      />
    </span>
  );
}

export function LogoLockup({
  className = "",
  markClass = "h-11 w-11",
  stacked = true,
  tone = "dark",
}: {
  className?: string;
  markClass?: string;
  stacked?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className={markClass} tone={tone} />
      <span className={stacked ? "flex flex-col leading-none" : "flex items-baseline gap-2"}>
        <span className="font-display text-[1.45rem] font-bold tracking-tight">RootSym</span>
        <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.3em] opacity-70">
          By Rand Saleh
        </span>
      </span>
    </span>
  );
}
