"use client";

import { useState } from "react";
import { Activity, Cog, Sprout, Trophy, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { GameShell, ProgressDots } from "./GameShell";

const ACCENT = "#e07a28";

type Kind = "symptom" | "cause" | "root";

type Card = { en: string; ar: string; answer: Kind; whyEn: string; whyAr: string };

const CARDS: Card[] = [
  {
    en: "Customer complaints about leaking cartons rose 30% last month.",
    ar: "ارتفعت شكاوى العملاء من تسريب الكراتين ٣٠٪ الشهر الماضي.",
    answer: "symptom",
    whyEn: "A measured effect. It tells you where to look, never why.",
    whyAr: "أثر مقيس. يدلّك أين تبحث، لا لماذا حدث.",
  },
  {
    en: "The sealing bar runs 12°C below setpoint after two hours.",
    ar: "قضيب اللحام يعمل أقل من نقطة الضبط بـ ١٢ درجة بعد ساعتين.",
    answer: "cause",
    whyEn: "A real mechanism that produces the leak — but something allowed the drift.",
    whyAr: "آلية حقيقية تُنتج التسريب — لكن شيئًا ما سمح بهذا الانحراف.",
  },
  {
    en: "There is no calibration schedule for the sealing bar thermocouple.",
    ar: "لا يوجد جدول معايرة للمزدوجة الحرارية لقضيب اللحام.",
    answer: "root",
    whyEn: "A missing system condition. Fix this and the drift cannot return unnoticed.",
    whyAr: "حالة نظامية مفقودة. أصلحها ولن يعود الانحراف دون ملاحظة.",
  },
  {
    en: "Operators restart the filler three times per shift.",
    ar: "يُعيد المشغّلون تشغيل ماكينة التعبئة ثلاث مرات في الوردية.",
    answer: "symptom",
    whyEn: "Visible behaviour caused by something upstream. Ask what forces the restart.",
    whyAr: "سلوك ظاهر ناتج عن شيء سابق له. اسأل: ما الذي يفرض إعادة التشغيل؟",
  },
  {
    en: "The new film supplier's material needs a higher sealing temperature.",
    ar: "مادة المورّد الجديد للفيلم تحتاج حرارة لحام أعلى.",
    answer: "cause",
    whyEn: "A genuine cause — and a clue. Why did the process not change with the material?",
    whyAr: "سبب حقيقي — ودليل أيضًا. لماذا لم تتغير العملية مع تغيّر المادة؟",
  },
  {
    en: "A supplier change was approved without a process validation step.",
    ar: "تمت الموافقة على تغيير المورّد دون خطوة تحقّق من العملية.",
    answer: "root",
    whyEn: "The gate that should have caught it does not exist. That is a root cause.",
    whyAr: "البوابة التي كان يجب أن تكتشفه غير موجودة أصلًا. هذا سبب جذري.",
  },
  {
    en: "OEE on Line 2 dropped from 78% to 64%.",
    ar: "انخفضت الكفاءة الإجمالية للخط الثاني من ٧٨٪ إلى ٦٤٪.",
    answer: "symptom",
    whyEn: "An indicator moving. Indicators never explain themselves.",
    whyAr: "مؤشر يتحرّك. والمؤشرات لا تفسّر نفسها أبدًا.",
  },
  {
    en: "Changeover takes 45 minutes against a 20-minute standard.",
    ar: "التحويل يستغرق ٤٥ دقيقة مقابل معيار ٢٠ دقيقة.",
    answer: "cause",
    whyEn: "A concrete cause of lost hours — now ask why the standard is not achievable.",
    whyAr: "سبب ملموس للساعات المفقودة — والآن اسأل لماذا المعيار غير قابل للتحقيق.",
  },
  {
    en: "The changeover standard was written for the old tooling and never updated.",
    ar: "معيار التحويل كُتب للعُدد القديمة ولم يُحدَّث أبدًا.",
    answer: "root",
    whyEn: "The standard itself is wrong. Every downstream effort is compensating for it.",
    whyAr: "المعيار نفسه خاطئ. وكل جهد لاحق يعوّض عن هذا الخطأ فقط.",
  },
  {
    en: "Scrap is higher on the night shift than on days.",
    ar: "الهدر في الوردية الليلية أعلى منه في النهارية.",
    answer: "symptom",
    whyEn: "A pattern, not a cause. It narrows the search — do not stop here and blame a shift.",
    whyAr: "نمط لا سبب. يضيّق البحث — لا تتوقف هنا وتلوم الوردية.",
  },
];

const OPTIONS: { key: Kind; icon: typeof Activity; en: string; ar: string; tint: string }[] = [
  { key: "symptom", icon: Activity, en: "Symptom", ar: "عَرَض", tint: "#e07a28" },
  { key: "cause", icon: Cog, en: "Cause", ar: "سبب", tint: "#2e86ab" },
  { key: "root", icon: Sprout, en: "Root cause", ar: "سبب جذري", tint: "#2f6b4f" },
];

export default function RootOrSymptom({ index }: { index: number }) {
  const { t, fill, locale } = useI18n();
  const isAr = locale === "ar";
  const game = t.playground.games.rootOrSymptom;

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Kind | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const card = CARDS[i];

  function choose(kind: Kind) {
    if (picked) return;
    setPicked(kind);
    if (kind === card.answer) setScore((s) => s + 1);
  }

  function next() {
    if (i + 1 >= CARDS.length) {
      setDone(true);
      return;
    }
    setI((v) => v + 1);
    setPicked(null);
  }

  function restart() {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  return (
    <GameShell
      id="rootOrSymptom"
      index={index}
      title={game.title}
      desc={game.desc}
      accent={ACCENT}
      score={score}
      total={CARDS.length}
      onRestart={restart}
    >
      {done ? (
        <div className="rounded-2xl border border-gold/45 bg-gold/8 p-6 text-center">
          <Trophy className="mx-auto h-9 w-9 text-gold" strokeWidth={1.4} />
          <p className="mt-4 font-display text-2xl font-semibold text-abyss">
            {fill(t.playground.yourScore, { score, total: CARDS.length })}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-[0.88rem] leading-relaxed text-slate-ink">
            {isAr
              ? "القاعدة العملية: العَرَض يُقاس، والسبب يُشرَح، والسبب الجذري يصف غياب نظام."
              : "The working rule: a symptom is measured, a cause is explained, and a root cause describes a system that is missing."}
          </p>
          <button type="button" onClick={restart} className="btn-outline mt-6">
            {t.playground.replay}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <ProgressDots total={CARDS.length} current={i} accent={ACCENT} />
            <span className="font-mono text-[0.68rem] text-slate-ink/60">
              {i + 1}/{CARDS.length}
            </span>
          </div>

          <div
            key={i}
            className="mt-6 rounded-2xl border border-dune bg-gradient-to-br from-sand/70 to-parchment p-8 text-center"
            style={{ animation: "float 0.6s ease" }}
          >
            <p className="mx-auto max-w-xl font-display text-[1.45rem] leading-snug text-abyss">
              {isAr ? card.ar : card.en}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {OPTIONS.map((opt) => {
              const isAnswer = opt.key === card.answer;
              const isPicked = picked === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => choose(opt.key)}
                  disabled={Boolean(picked)}
                  className={`flex flex-col items-center gap-2.5 rounded-2xl border p-5 transition-all duration-400 ${
                    picked && isAnswer
                      ? "border-leaf bg-leaf/12"
                      : isPicked
                        ? "border-ember bg-ember/12"
                        : picked
                          ? "border-dune bg-cream opacity-50"
                          : "border-dune bg-cream hover:-translate-y-1 hover:border-gold/60 hover:shadow-lux"
                  }`}
                >
                  <opt.icon className="h-6 w-6" strokeWidth={1.5} style={{ color: opt.tint }} />
                  <span className="font-display text-[1.05rem] font-semibold text-abyss">
                    {isAr ? opt.ar : opt.en}
                  </span>
                </button>
              );
            })}
          </div>

          {picked && (
            <>
              <p
                className={`mt-5 rounded-2xl border p-5 text-[0.9rem] leading-relaxed ${
                  picked === card.answer
                    ? "border-leaf/45 bg-leaf/8 text-abyss"
                    : "border-ember/45 bg-ember/8 text-abyss"
                }`}
              >
                <strong className="block font-semibold">
                  {picked === card.answer ? t.playground.correct : t.playground.wrong}
                </strong>
                <span className="mt-1.5 block text-slate-ink">{isAr ? card.whyAr : card.whyEn}</span>
              </p>
              <button type="button" onClick={next} className="btn-gold mt-5">
                {i + 1 >= CARDS.length ? t.playground.finish : t.playground.next}
                <ArrowRight className="h-4 w-4 flip-x" strokeWidth={2} />
              </button>
            </>
          )}
        </>
      )}
    </GameShell>
  );
}
