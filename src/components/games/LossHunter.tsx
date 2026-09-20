"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Timer, Trophy, Play, Zap } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { GameShell } from "./GameShell";

const ACCENT = "#c9a227";
const ROUND_SECONDS = 60;
const LIFETIME_MS = 5200;

type Item = {
  id: number;
  en: string;
  ar: string;
  waste: boolean;
  tagEn: string;
  tagAr: string;
  left: number;
  lane: number;
};

const WASTES = [
  { en: "Pallets waiting for the forklift", ar: "منصات تنتظر الرافعة", tagEn: "Waiting", tagAr: "انتظار" },
  { en: "Operator walks 40 m for tape", ar: "المشغّل يمشي ٤٠ مترًا لإحضار الشريط", tagEn: "Motion", tagAr: "حركة" },
  { en: "Three weeks of finished goods in the aisle", ar: "ثلاثة أسابيع من المنتج الجاهز في الممر", tagEn: "Inventory", tagAr: "مخزون" },
  { en: "Re-printing mislabelled cartons", ar: "إعادة طباعة كراتين بملصقات خاطئة", tagEn: "Defects", tagAr: "عيوب" },
  { en: "Keying the same data into two systems", ar: "إدخال البيانات نفسها في نظامين", tagEn: "Extra processing", tagAr: "معالجة زائدة" },
  { en: "Running faster than the customer needs", ar: "التشغيل أسرع مما يحتاجه العميل", tagEn: "Overproduction", tagAr: "إفراط في الإنتاج" },
  { en: "Moving WIP across the plant twice", ar: "نقل الإنتاج تحت التشغيل عبر المصنع مرتين", tagEn: "Transport", tagAr: "نقل" },
  { en: "A trained engineer doing manual counts", ar: "مهندس مدرَّب يقوم بالعدّ اليدوي", tagEn: "Unused talent", tagAr: "طاقات غير مستثمرة" },
  { en: "Waiting for a quality release signature", ar: "انتظار توقيع الإفراج من الجودة", tagEn: "Waiting", tagAr: "انتظار" },
  { en: "Searching for the changeover tool", ar: "البحث عن عدّة التحويل", tagEn: "Motion", tagAr: "حركة" },
];

const VALUE = [
  { en: "Sealing the carton", ar: "لحام الكرتونة" },
  { en: "Filling the product", ar: "تعبئة المنتج" },
  { en: "Cutting the film to length", ar: "قصّ الفيلم بالطول المطلوب" },
  { en: "Printing the batch code", ar: "طباعة رمز التشغيلة" },
  { en: "Applying the label", ar: "لصق الملصق" },
];

export default function LossHunter({ index }: { index: number }) {
  const { t, fill, locale } = useI18n();
  const isAr = locale === "ar";
  const game = t.playground.games.lossHunter;

  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<{ id: number; good: boolean } | null>(null);
  const nextId = useRef(1);

  const reset = useCallback(() => {
    setRunning(false);
    setDone(false);
    setSeconds(ROUND_SECONDS);
    setItems([]);
    setScore(0);
    setHits(0);
    setMisses(0);
  }, []);

  function start() {
    reset();
    setRunning(true);
  }

  // countdown
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          setDone(true);
          setItems([]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // spawner
  useEffect(() => {
    if (!running) return;
    const spawn = () => {
      const isWaste = Math.random() < 0.62;
      const source = isWaste ? WASTES : VALUE;
      const pick = source[Math.floor(Math.random() * source.length)];
      const id = nextId.current++;
      const item: Item = {
        id,
        en: pick.en,
        ar: pick.ar,
        waste: isWaste,
        tagEn: isWaste ? (pick as (typeof WASTES)[number]).tagEn : "Value adding",
        tagAr: isWaste ? (pick as (typeof WASTES)[number]).tagAr : "نشاط ذو قيمة",
        left: 3 + Math.random() * 66,
        lane: Math.floor(Math.random() * 4),
      };
      setItems((prev) => [...prev, item]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }, LIFETIME_MS);
    };
    spawn();
    const id = window.setInterval(spawn, 900);
    return () => window.clearInterval(id);
  }, [running]);

  function hit(item: Item) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setFlash({ id: item.id, good: item.waste });
    window.setTimeout(() => setFlash(null), 500);
    if (item.waste) {
      setScore((s) => s + 1);
      setHits((h) => h + 1);
    } else {
      setScore((s) => Math.max(0, s - 1));
      setMisses((m) => m + 1);
    }
  }

  return (
    <GameShell
      id="lossHunter"
      index={index}
      title={game.title}
      desc={game.desc}
      accent={ACCENT}
      onRestart={done || running ? reset : undefined}
      toolbar={
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.75rem] font-semibold tabular-nums ${
            seconds <= 10 && running
              ? "border-ember/60 bg-ember/15 text-flame"
              : "border-sky/20 bg-white/5 text-brass"
          }`}
        >
          <Timer className="h-3.5 w-3.5" strokeWidth={2} />
          {String(seconds).padStart(2, "0")}s
        </span>
      }
    >
      <div className="relative h-[24rem] overflow-hidden rounded-2xl border border-dune bg-gradient-to-b from-ink to-deep">
        <div className="blueprint-dark absolute inset-0 opacity-70" />

        {/* conveyor */}
        <div className="absolute inset-x-0 bottom-0 h-16 border-t border-sky/15 bg-ink/70">
          <div className="absolute inset-0 flex items-center gap-6 overflow-hidden px-4">
            {Array.from({ length: 22 }).map((_, i) => (
              <span key={i} className="h-7 w-7 shrink-0 rounded-full border border-sky/15" />
            ))}
          </div>
        </div>

        {!running && !done && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-ink/70 backdrop-blur-sm">
            <Zap className="h-9 w-9 text-brass animate-float" strokeWidth={1.4} />
            <p className="max-w-sm px-6 text-center text-[0.9rem] leading-relaxed text-sky/80">
              {isAr
                ? "ستمرّ أنشطة على الخط. اضغط على الهدر فقط — واترك الأنشطة ذات القيمة تمرّ."
                : "Activities will run past. Click only the waste — let the value-adding steps go by."}
            </p>
            <button type="button" onClick={start} className="btn-gold">
              <Play className="h-4 w-4 flip-x" strokeWidth={2} />
              {t.playground.play}
            </button>
          </div>
        )}

        {done && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-ink/80 px-6 text-center backdrop-blur-sm">
            <Trophy className="h-9 w-9 text-gold" strokeWidth={1.4} />
            <p className="font-display text-3xl font-semibold text-cream">
              {fill(t.playground.yourScore, { score, total: hits + misses || score })}
            </p>
            <p className="text-[0.84rem] text-sky/70">
              {isAr
                ? `أصبت ${hits} نوعًا من الهدر، وأخطأت ${misses} مرة.`
                : `${hits} wastes caught · ${misses} value-adding steps hit by mistake`}
            </p>
            <button type="button" onClick={start} className="btn-gold mt-2">
              {t.playground.replay}
            </button>
          </div>
        )}

        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => hit(item)}
            className="absolute max-w-[14rem] rounded-xl border border-sky/25 bg-white/[0.07] px-3.5 py-2.5 text-start text-[0.76rem] leading-snug text-cream backdrop-blur-sm transition-transform duration-200 hover:scale-105 hover:border-gold/60 hover:bg-gold/10"
            style={{
              insetInlineStart: `${item.left}%`,
              bottom: `${4.2 + item.lane * 2.1}rem`,
              animation: `riseFade ${LIFETIME_MS}ms linear forwards`,
            }}
          >
            {isAr ? item.ar : item.en}
          </button>
        ))}

        {flash && (
          <span
            className={`pointer-events-none absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-5xl font-bold ${
              flash.good ? "text-sprout" : "text-flame"
            }`}
            style={{ animation: "popOut .5s ease forwards" }}
          >
            {flash.good ? "+1" : "−1"}
          </span>
        )}

        {(running || done) && (
          <span className="absolute end-4 top-4 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-[0.78rem] font-semibold text-brass tabular-nums">
            {t.playground.score} {score}
          </span>
        )}
      </div>

      <p className="mt-5 text-[0.84rem] leading-relaxed text-slate-ink">
        {isAr
          ? "الأنواع الثمانية للهدر: الإفراط في الإنتاج، الانتظار، النقل، المعالجة الزائدة، المخزون، الحركة، العيوب، والطاقات غير المستثمرة."
          : "The eight wastes: Defects, Overproduction, Waiting, Non-utilised talent, Transportation, Inventory, Motion, Extra processing — DOWNTIME."}
      </p>
    </GameShell>
  );
}
