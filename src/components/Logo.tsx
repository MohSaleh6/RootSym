"use client";

/**
 * The RootSym mark, rebuilt as vector: a tree whose canopy is a gear train
 * and whose roots fan out below, wrapped in an open circuit ring.
 */

function gearPath(cx: number, cy: number, rRoot: number, rTip: number, teeth: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i += 1) {
    const a0 = i * step;
    const a1 = a0 + step * 0.28;
    const a2 = a0 + step * 0.5;
    const a3 = a0 + step * 0.78;
    const p = (a: number, r: number) =>
      `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
    pts.push(`${i === 0 ? "M" : "L"}${p(a0, rRoot)}`, `L${p(a1, rTip)}`, `L${p(a2, rTip)}`, `L${p(a3, rRoot)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}

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
  const id = tone === "light" ? "l" : "d";
  const teal = `url(#rs-teal-${id})`;
  const green = `url(#rs-green-${id})`;
  const gold = `url(#rs-gold-${id})`;
  const solidGreen = tone === "light" ? "#84bd9c" : "#2f6b4f";
  const solidTide = tone === "light" ? "#6bb3cf" : "#2e86ab";
  const solidEmber = tone === "light" ? "#ef9448" : "#e07a28";
  const leafA = tone === "light" ? "#84bd9c" : "#4a8f68";
  const leafB = tone === "light" ? "#4a8f68" : "#2f6b4f";

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="RootSym">
      <defs>
        <linearGradient id={`rs-teal-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tone === "light" ? "#8ecbe4" : "#2e86ab"} />
          <stop offset="100%" stopColor={tone === "light" ? "#2e86ab" : "#0b2a36"} />
        </linearGradient>
        <linearGradient id={`rs-green-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={tone === "light" ? "#4a8f68" : "#245c44"} />
          <stop offset="100%" stopColor={tone === "light" ? "#a8d6ba" : "#4a8f68"} />
        </linearGradient>
        <linearGradient id={`rs-gold-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d98f" />
          <stop offset="55%" stopColor="#dcb75a" />
          <stop offset="100%" stopColor="#e8873b" />
        </linearGradient>
      </defs>

      {/* open circuit ring */}
      <path
        d="M158 48a78 78 0 1 0 16 44"
        fill="none"
        stroke={teal}
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M38 132A74 74 0 0 1 60 40"
        fill="none"
        stroke={green}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* gear canopy */}
      <g className={animated ? "origin-[62px_66px] animate-[spin_26s_linear_infinite]" : ""}>
        <path d={gearPath(62, 66, 17, 23, 10)} fill="none" stroke={teal} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="62" cy="66" r="7" fill="none" stroke={tone === "light" ? "#dcb75a" : "#c9a227"} strokeWidth="3.5" />
      </g>
      <g className={animated ? "origin-[100px_44px] animate-[spin_18s_linear_infinite_reverse]" : ""}>
        <path d={gearPath(100, 44, 11, 15.5, 8)} fill="none" stroke={green} strokeWidth="3.6" strokeLinejoin="round" />
        <circle cx="100" cy="44" r="4.5" fill="none" stroke={tone === "light" ? "#dcb75a" : "#c9a227"} strokeWidth="3" />
      </g>
      <g className={animated ? "origin-[40px_100px] animate-[spin_32s_linear_infinite]" : ""}>
        <path d={gearPath(40, 100, 8.5, 12, 8)} fill="none" stroke={solidGreen} strokeWidth="3.2" strokeLinejoin="round" />
        <circle cx="40" cy="100" r="3.4" fill={tone === "light" ? "#dcb75a" : "#c9a227"} />
      </g>

      {/* rising growth arrow */}
      <path
        d="M104 92l16-20 12 12 20-28"
        fill="none"
        stroke={gold}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M140 56h16v16" fill="none" stroke={solidEmber} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      {/* signal nodes */}
      <rect x="132" y="86" width="14" height="14" rx="3" fill="none" stroke={solidTide} strokeWidth="3.4" />
      <path d="M146 93h12" stroke={tone === "light" ? "#dcb75a" : "#c9a227"} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="152" cy="112" r="6" fill="none" stroke={solidGreen} strokeWidth="3.4" />
      <path d="M139 100v6h13" fill="none" stroke={solidTide} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* trunk + roots */}
      <path d="M92 74v52" stroke={green} strokeWidth="6.5" strokeLinecap="round" />
      <path
        d="M92 126c-14 6-22 14-34 20M92 126c-8 10-10 18-12 30M92 126c14 6 22 13 36 18M92 126c8 10 11 17 14 29M92 126c-24 2-36 8-52 10M92 126c24 2 38 7 54 8"
        fill="none"
        stroke={green}
        strokeWidth="3.6"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M58 146c-6 5-12 7-20 8M80 156c-3 6-4 10-4 16M128 144c6 5 12 8 20 9M106 155c2 6 3 10 3 15"
        fill="none"
        stroke={leafA}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* leaves */}
      <path d="M92 96c10-2 16-8 17-17-10 1-16 7-17 17Z" fill={leafA} opacity="0.9" />
      <path d="M92 112c-10-2-16-8-17-17 10 1 16 7 17 17Z" fill={leafB} opacity="0.85" />
    </svg>
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
