import type { ReactNode } from "react";

export function AdminTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dune pb-6">
      <div>
        <h1 className="font-display text-[2rem] font-semibold leading-tight text-abyss">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[0.9rem] text-slate-ink">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-dune bg-parchment ${padded ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "gold" | "green" | "ember";
}) {
  const tones = {
    default: "text-abyss",
    gold: "text-gold",
    green: "text-moss",
    ember: "text-ember",
  } as const;
  return (
    <div className="group rounded-2xl border border-dune bg-parchment p-5 transition-all duration-400 hover:-translate-y-1 hover:border-gold/45 hover:shadow-lux">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-ink/65">
        {label}
      </p>
      <p className={`mt-3 font-display text-3xl font-semibold tabular-nums ${tones[tone]}`}>
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[0.76rem] text-slate-ink/70">{hint}</p>}
    </div>
  );
}

const BADGES: Record<string, string> = {
  PAID: "border-leaf/50 bg-leaf/12 text-moss",
  PENDING: "border-tide/45 bg-tide/12 text-teal",
  AWAITING_REVIEW: "border-gold/50 bg-gold/12 text-gold",
  CANCELLED: "border-slate-ink/30 bg-slate-ink/10 text-slate-ink",
  REFUNDED: "border-ember/50 bg-ember/12 text-ember",
  OPEN: "border-leaf/50 bg-leaf/12 text-moss",
  SCHEDULED: "border-tide/45 bg-tide/12 text-teal",
  FULL: "border-gold/50 bg-gold/12 text-gold",
  COMPLETED: "border-slate-ink/30 bg-slate-ink/10 text-slate-ink",
};

export function Badge({ value }: { value: string }) {
  const skin = BADGES[value] ?? "border-dune bg-sand text-slate-ink";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.1em] ${skin}`}
    >
      {value.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-dune bg-parchment/60 p-12 text-center text-[0.9rem] text-slate-ink">
      {children}
    </div>
  );
}
