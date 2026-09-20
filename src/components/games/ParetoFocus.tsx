"use client";

import { useMemo, useState } from "react";
import { Trophy, Target, Check } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { GameShell } from "./GameShell";

const ACCENT = "#1b5e75";

type Loss = { id: string; en: string; ar: string; hours: number };

const LOSSES: Loss[] = [
  { id: "l1", en: "Unplanned downtime — wrapper jams", ar: "توقف غير مخطط — انحشار ماكينة التغليف", hours: 182 },
  { id: "l2", en: "Changeover time over standard", ar: "زمن التحويل فوق المعيار", hours: 126 },
  { id: "l3", en: "Speed loss — minor stops", ar: "فقد السرعة — توقفات صغيرة", hours: 98 },
  { id: "l4", en: "Quality — sealing defects", ar: "الجودة — عيوب اللحام", hours: 74 },
  { id: "l5", en: "Material waste — film", ar: "هدر المواد — الفيلم", hours: 41 },
  { id: "l6", en: "Planned maintenance overrun", ar: "تجاوز وقت الصيانة المخططة", hours: 28 },
  { id: "l7", en: "Overlapping operator breaks", ar: "تداخل استراحات المشغّلين", hours: 19 },
  { id: "l8", en: "Start-up losses", ar: "خسائر بدء التشغيل", hours: 15 },
  { id: "l9", en: "Label misprints", ar: "أخطاء طباعة الملصقات", hours: 11 },
  { id: "l10", en: "Waiting for the forklift", ar: "انتظار الرافعة", hours: 8 },
  { id: "l11", en: "Cleaning overrun", ar: "تجاوز وقت التنظيف", hours: 6 },
  { id: "l12", en: "Meetings during run time", ar: "اجتماعات أثناء وقت التشغيل", hours: 4 },
];

const TOTAL = LOSSES.reduce((sum, l) => sum + l.hours, 0);
const TARGET = TOTAL * 0.8;

/** Smallest number of categories (taken largest-first) that clears 80%. */
const IDEAL = (() => {
  const sorted = [...LOSSES].sort((a, b) => b.hours - a.hours);
  let acc = 0;
  let n = 0;
  for (const l of sorted) {
    acc += l.hours;
    n += 1;
    if (acc >= TARGET) break;
  }
  return { count: n, ids: sorted.slice(0, n).map((l) => l.id) };
})();

export default function ParetoFocus({ index }: { index: number }) {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const game = t.playground.games.pareto;

  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const selectedHours = useMemo(
    () => LOSSES.filter((l) => picked.includes(l.id)).reduce((s, l) => s + l.hours, 0),
    [picked],
  );
  const pct = (selectedHours / TOTAL) * 100;
  const reached = selectedHours >= TARGET;
  const perfect = reached && picked.length === IDEAL.count;
  const max = Math.max(...LOSSES.map((l) => l.hours));

  function toggle(id: string) {
    if (checked) return;
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function restart() {
    setPicked([]);
    setChecked(false);
  }

  return (
    <GameShell
      id="pareto"
      index={index}
      title={game.title}
      desc={game.desc}
      accent={ACCENT}
      onRestart={restart}
      toolbar={
        <span className="rounded-full border border-sky/20 bg-white/5 px-4 py-2 text-[0.75rem] font-semibold tabular-nums text-brass">
          {pct.toFixed(0)}% / 80%
        </span>
      }
    >
      {/* cumulative meter */}
      <div className="rounded-2xl border border-dune bg-sand/60 p-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-ink/65">
            {isAr ? "الخسارة المستردة" : "Loss recovered"}
          </p>
          <p className="font-display text-2xl font-semibold text-abyss tabular-nums">
            {selectedHours}
            <span className="text-base text-slate-ink/70"> / {TOTAL} h</span>
          </p>
        </div>
        <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-dune">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, pct)}%`,
              background: reached
                ? "linear-gradient(90deg,#2f6b4f,#4a8f68)"
                : "linear-gradient(90deg,#1b5e75,#2e86ab)",
            }}
          />
          <span
            className="absolute inset-y-0 w-px bg-ember"
            style={{ insetInlineStart: "80%" }}
            title="80%"
          />
        </div>
        <p className="mt-2.5 text-[0.76rem] text-slate-ink/70">
          {isAr
            ? `اخترت ${picked.length} من ١٢ فئة. الخط البرتقالي هو هدف الـ٨٠٪.`
            : `${picked.length} of 12 categories selected. The orange line is the 80% target.`}
        </p>
      </div>

      {/* bars */}
      <ul className="mt-6 space-y-2">
        {[...LOSSES]
          .sort((a, b) => b.hours - a.hours)
          .map((l) => {
            const on = picked.includes(l.id);
            const ideal = IDEAL.ids.includes(l.id);
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => toggle(l.id)}
                  disabled={checked}
                  className={`group flex w-full items-center gap-4 rounded-xl border p-3.5 text-start transition-all duration-300 ${
                    checked
                      ? ideal
                        ? "border-leaf/50 bg-leaf/8"
                        : on
                          ? "border-ember/50 bg-ember/8"
                          : "border-dune bg-cream opacity-60"
                      : on
                        ? "border-gold bg-gold/10"
                        : "border-dune bg-cream hover:border-teal/45"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      on ? "border-gold bg-gold" : "border-dune bg-parchment"
                    }`}
                  >
                    {on && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.86rem] text-abyss">
                      {isAr ? l.ar : l.en}
                    </span>
                    <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-dune/70">
                      <span
                        className="block h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(l.hours / max) * 100}%`,
                          background: on
                            ? "linear-gradient(90deg,#c9a227,#e07a28)"
                            : "linear-gradient(90deg,#1b5e75,#2e86ab)",
                        }}
                      />
                    </span>
                  </span>

                  <span className="shrink-0 font-mono text-[0.78rem] text-slate-ink tabular-nums">
                    {l.hours}h
                  </span>
                </button>
              </li>
            );
          })}
      </ul>

      {checked ? (
        <div className="mt-6 rounded-2xl border border-gold/45 bg-gold/8 p-6 text-center">
          <Trophy className="mx-auto h-9 w-9 text-gold" strokeWidth={1.4} />
          <p className="mt-4 font-display text-2xl font-semibold text-abyss">
            {perfect
              ? isAr
                ? "القِلّة الحيوية بالضبط."
                : "Exactly the vital few."
              : reached
                ? isAr
                  ? "وصلت إلى ٨٠٪ — لكن بجهد أكبر من اللازم."
                  : "You reached 80% — but spread across more fronts than needed."
                : isAr
                  ? "لم تصل إلى ٨٠٪ بعد."
                  : "You did not reach 80%."}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-[0.88rem] leading-relaxed text-slate-ink">
            {isAr
              ? `${IDEAL.count} فئات فقط تستعيد أكثر من ٨٠٪ من الخسارة. كل فئة إضافية تُوزّع جهد فريقك على مكاسب أصغر.`
              : `Just ${IDEAL.count} categories recover more than 80% of the loss. Every extra front you open spreads your team across smaller and smaller wins.`}
          </p>
          <button type="button" onClick={restart} className="btn-outline mt-6">
            {t.playground.replay}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={picked.length === 0}
          className="btn-gold mt-6 disabled:opacity-40"
        >
          <Target className="h-4 w-4" strokeWidth={2} />
          {t.playground.finish}
        </button>
      )}
    </GameShell>
  );
}
