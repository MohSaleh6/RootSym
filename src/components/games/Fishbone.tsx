"use client";

import { useMemo, useState } from "react";
import { Check, X, Trophy, Fish } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { GameShell } from "./GameShell";

const ACCENT = "#2f6b4f";

type CategoryKey = "man" | "machine" | "method" | "material" | "measurement" | "environment";

const CATEGORIES: { key: CategoryKey; en: string; ar: string; tint: string }[] = [
  { key: "man", en: "Man", ar: "الإنسان", tint: "#2e86ab" },
  { key: "machine", en: "Machine", ar: "الآلة", tint: "#1b5e75" },
  { key: "method", en: "Method", ar: "الطريقة", tint: "#2f6b4f" },
  { key: "material", en: "Material", ar: "المواد", tint: "#4a8f68" },
  { key: "measurement", en: "Measurement", ar: "القياس", tint: "#c9a227" },
  { key: "environment", en: "Environment", ar: "البيئة", tint: "#e07a28" },
];

type Cause = { id: string; en: string; ar: string; answer: CategoryKey };

const CAUSES: Cause[] = [
  { id: "c1", en: "Night-shift operators were never trained on the splicer", ar: "مشغّلو الوردية الليلية لم يُدرَّبوا على جهاز الوصل", answer: "man" },
  { id: "c2", en: "Shift handover is verbal only — nothing written down", ar: "تسليم الوردية شفهي فقط — لا شيء مكتوب", answer: "man" },
  { id: "c3", en: "The automatic splicer has been out of service for weeks", ar: "جهاز الوصل الآلي معطّل منذ أسابيع", answer: "machine" },
  { id: "c4", en: "The wrapper's film sensor drifts as the head heats up", ar: "حسّاس الفيلم في الماكينة ينحرف مع سخونة الرأس", answer: "machine" },
  { id: "c5", en: "No written standard exists for an emergency hand splice", ar: "لا يوجد معيار مكتوب للوصل اليدوي الطارئ", answer: "method" },
  { id: "c6", en: "The changeover checklist skips the film path entirely", ar: "قائمة فحص التحويل تتجاوز مسار الفيلم بالكامل", answer: "method" },
  { id: "c7", en: "The new film reel is 8 microns thicker than the old one", ar: "بكرة الفيلم الجديدة أسمك بـ ٨ ميكرون من القديمة", answer: "material" },
  { id: "c8", en: "The tape used for splices is not an approved consumable", ar: "الشريط المستخدم للوصل ليس من المواد المعتمدة", answer: "material" },
  { id: "c9", en: "Downtime is written on paper at the end of the shift", ar: "يُسجَّل التوقف على الورق في نهاية الوردية", answer: "measurement" },
  { id: "c10", en: "Sensor calibration is checked yearly with no record kept", ar: "معايرة الحسّاس تُفحص سنويًا دون حفظ أي سجل", answer: "measurement" },
  { id: "c11", en: "The Line 3 area runs 6°C hotter through the summer", ar: "منطقة الخط الثالث أعلى حرارة بـ ٦ درجات طوال الصيف", answer: "environment" },
  { id: "c12", en: "Lighting at the film reel station is below standard", ar: "الإضاءة عند محطة بكرة الفيلم أقل من المعيار", answer: "environment" },
];

export default function Fishbone({ index }: { index: number }) {
  const { t, fill, locale } = useI18n();
  const isAr = locale === "ar";
  const game = t.playground.games.fishbone;

  const [assigned, setAssigned] = useState<Record<string, CategoryKey>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const pool = useMemo(() => CAUSES.filter((c) => !(c.id in assigned)), [assigned]);
  const score = useMemo(
    () => CAUSES.filter((c) => assigned[c.id] === c.answer).length,
    [assigned],
  );
  const complete = pool.length === 0;

  function assign(category: CategoryKey) {
    if (!selected || checked) return;
    setAssigned((prev) => ({ ...prev, [selected]: category }));
    setSelected(null);
  }

  function unassign(id: string) {
    if (checked) return;
    setAssigned((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function restart() {
    setAssigned({});
    setSelected(null);
    setChecked(false);
  }

  return (
    <GameShell
      id="fishbone"
      index={index}
      title={game.title}
      desc={game.desc}
      accent={ACCENT}
      score={checked ? score : undefined}
      total={checked ? CAUSES.length : undefined}
      onRestart={restart}
    >
      {/* the pool */}
      <div className="rounded-2xl border border-dune bg-sand/60 p-5">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-ink/65">
          {isAr ? "اختر سببًا ثم اختر فئته" : "Pick a cause, then pick its category"}
        </p>
        {pool.length === 0 ? (
          <p className="mt-3 text-[0.88rem] text-slate-ink">
            {isAr ? "تم توزيع كل الأسباب." : "Every cause has been placed."}
          </p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {pool.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelected(selected === c.id ? null : c.id)}
                  className={`rounded-xl border px-3.5 py-2.5 text-start text-[0.82rem] leading-snug transition-all duration-300 ${
                    selected === c.id
                      ? "border-gold bg-gold/15 text-abyss shadow-gold"
                      : "border-dune bg-parchment text-slate-ink hover:-translate-y-0.5 hover:border-teal/50"
                  }`}
                >
                  {isAr ? c.ar : c.en}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* the spine */}
      <div className="relative mt-7">
        <div className="pointer-events-none absolute inset-x-6 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-tide/40 via-moss/40 to-gold/50 lg:block" />
        <div className="pointer-events-none absolute end-0 top-1/2 hidden -translate-y-1/2 lg:block">
          <Fish className="h-7 w-7 text-gold/50 flip-x" strokeWidth={1.4} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const items = CAUSES.filter((c) => assigned[c.id] === cat.key);
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => assign(cat.key)}
                disabled={!selected || checked}
                className={`relative flex min-h-[9.5rem] flex-col rounded-2xl border p-4 text-start transition-all duration-400 ${
                  selected && !checked
                    ? "border-dashed border-gold/60 bg-gold/5 hover:-translate-y-1 hover:border-gold hover:bg-gold/12"
                    : "border-dune bg-cream"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.tint }} />
                  <span className="font-display text-[1.05rem] font-semibold text-abyss">
                    {isAr ? cat.ar : cat.en}
                  </span>
                </span>

                <ul className="mt-3 space-y-1.5">
                  {items.map((c) => {
                    const right = c.answer === cat.key;
                    return (
                      <li key={c.id}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            unassign(c.id);
                          }}
                          className={`flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-[0.76rem] leading-snug transition-colors ${
                            checked
                              ? right
                                ? "border-leaf/50 bg-leaf/10 text-abyss"
                                : "border-ember/50 bg-ember/10 text-abyss"
                              : "border-dune bg-parchment text-slate-ink hover:border-ember/50"
                          }`}
                        >
                          {checked &&
                            (right ? (
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-moss" strokeWidth={3} />
                            ) : (
                              <X className="mt-0.5 h-3 w-3 shrink-0 text-ember" strokeWidth={3} />
                            ))}
                          {isAr ? c.ar : c.en}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {checked ? (
        <div className="mt-7 rounded-2xl border border-gold/45 bg-gold/8 p-6 text-center">
          <Trophy className="mx-auto h-9 w-9 text-gold" strokeWidth={1.4} />
          <p className="mt-4 font-display text-2xl font-semibold text-abyss">
            {fill(t.playground.yourScore, { score, total: CAUSES.length })}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-[0.88rem] leading-relaxed text-slate-ink">
            {isAr
              ? "الفئة ليست هي الهدف — الهدف أن ترى أن معظم الأسباب تقع في الطريقة والقياس، وهناك تعيش الأسباب الجذرية عادةً."
              : "The category is not the point. The point is noticing how many causes land in Method and Measurement — which is where root causes usually live."}
          </p>
          <button type="button" onClick={restart} className="btn-outline mt-6">
            {t.playground.replay}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={!complete}
          className="btn-gold mt-7 disabled:opacity-40"
        >
          {complete
            ? t.playground.finish
            : `${CAUSES.length - pool.length}/${CAUSES.length}`}
        </button>
      )}
    </GameShell>
  );
}
