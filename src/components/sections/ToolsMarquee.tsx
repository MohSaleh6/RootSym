"use client";

const TOOLS = [
  "5 Whys",
  "Ishikawa / Fishbone",
  "Pareto Analysis",
  "Is / Is-Not",
  "Fault Tree Analysis",
  "A3 Thinking",
  "DMAIC",
  "Loss Tree",
  "Kaizen",
  "Gemba Walk",
  "FMEA",
  "PDCA",
  "Value Stream Mapping",
  "Standard Work",
  "Poka-Yoke",
  "8D",
];

export default function ToolsMarquee() {
  const row = [...TOOLS, ...TOOLS];
  return (
    <section
      className="relative overflow-hidden border-y border-dune bg-sand/60 py-5"
      aria-label="Methods and tools covered"
    >
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-gradient-to-r from-sand to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-24 bg-gradient-to-l from-sand to-transparent" />
      <div className="marquee-track gap-10" dir="ltr">
        {row.map((tool, i) => (
          <span
            key={`${tool}-${i}`}
            className="inline-flex shrink-0 items-center gap-3 font-display text-lg text-abyss/55 transition-colors duration-300 hover:text-gold"
          >
            {tool}
            <span className="inline-block h-1 w-1 rounded-full bg-gold/60" />
          </span>
        ))}
      </div>
    </section>
  );
}
