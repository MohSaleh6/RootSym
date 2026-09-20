"use client";

import { useState } from "react";
import { Check, X, Trophy, ArrowRight, Sprout } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { GameShell, ProgressDots } from "./GameShell";

const ACCENT = "#2e86ab";

type Option = { en: string; ar: string; correct?: boolean; feedbackEn: string; feedbackAr: string };
type Level = { qEn: string; qAr: string; options: Option[] };

const SCENARIO = {
  en: "Line 3 stopped for 47 minutes last night. The packaging wrapper jammed mid-run.",
  ar: "توقّف الخط الثالث ٤٧ دقيقة الليلة الماضية. علِقت ماكينة التغليف في منتصف التشغيل.",
};

const LEVELS: Level[] = [
  {
    qEn: "Why did the line stop?",
    qAr: "لماذا توقف الخط؟",
    options: [
      {
        en: "The wrapper jammed on a film splice.",
        ar: "علِقت الماكينة عند وصلة في الفيلم.",
        correct: true,
        feedbackEn: "Good — an observable fact about the failure, not an opinion about it.",
        feedbackAr: "ممتاز — حقيقة قابلة للملاحظة عن الخلل، لا رأي فيه.",
      },
      {
        en: "The night shift was careless.",
        ar: "الوردية الليلية كانت مهملة.",
        feedbackEn: "That is blame, not a cause. A Five Whys that finds a person has usually stopped too early.",
        feedbackAr: "هذا لوم لا سبب. تمرين الأسباب الخمسة الذي ينتهي عند شخص يكون غالبًا قد توقف مبكرًا.",
      },
      {
        en: "We lost 47 minutes of output.",
        ar: "خسرنا ٤٧ دقيقة من الإنتاج.",
        feedbackEn: "That is the consequence restated. You are still describing the symptom.",
        feedbackAr: "هذه إعادة صياغة للنتيجة. ما زلت تصف العَرَض.",
      },
    ],
  },
  {
    qEn: "Why did a film splice jam the wrapper?",
    qAr: "لماذا تسبّبت وصلة الفيلم في توقف الماكينة؟",
    options: [
      {
        en: "The splice was taped by hand and was thicker than the sensor tolerance.",
        ar: "الوصلة لُصقت يدويًا وكانت أسمك من حدود تحمّل الحسّاس.",
        correct: true,
        feedbackEn: "Exactly — a measurable mechanism links the splice to the stop.",
        feedbackAr: "بالضبط — آلية قابلة للقياس تربط الوصلة بالتوقف.",
      },
      {
        en: "The wrapper is old.",
        ar: "الماكينة قديمة.",
        feedbackEn: "Age is not a mechanism. Old machines that are maintained do not jam on spec-compliant film.",
        feedbackAr: "العمر ليس آلية. الماكينات القديمة المُصانة لا تعلق مع فيلم مطابق للمواصفة.",
      },
      {
        en: "Because the film ran out.",
        ar: "لأن الفيلم انتهى.",
        feedbackEn: "Sideways. Running out is normal and planned for — the question is why the splice failed.",
        feedbackAr: "انحراف جانبي. نفاد الفيلم أمر طبيعي ومخطّط له — السؤال لماذا فشلت الوصلة.",
      },
    ],
  },
  {
    qEn: "Why was the splice taped by hand?",
    qAr: "لماذا لُصقت الوصلة يدويًا؟",
    options: [
      {
        en: "The automatic splicer has been out of service for three weeks.",
        ar: "جهاز الوصل الآلي معطّل منذ ثلاثة أسابيع.",
        correct: true,
        feedbackEn: "Now you are moving from the event into the system that allowed it.",
        feedbackAr: "الآن تنتقل من الحدث إلى النظام الذي سمح به.",
      },
      {
        en: "Operators prefer doing it by hand.",
        ar: "المشغّلون يفضّلون القيام بها يدويًا.",
        feedbackEn: "Preference is a symptom of something else. Ask what makes the manual route the easy one.",
        feedbackAr: "التفضيل عَرَض لشيء آخر. اسأل: ما الذي يجعل الطريقة اليدوية هي الأسهل؟",
      },
      {
        en: "Tape is cheaper.",
        ar: "الشريط اللاصق أرخص.",
        feedbackEn: "A guess with no evidence behind it. Five Whys runs on facts you can check.",
        feedbackAr: "تخمين بلا دليل. تمرين الأسباب الخمسة يقوم على حقائق يمكن التحقق منها.",
      },
    ],
  },
  {
    qEn: "Why has the automatic splicer been out of service for three weeks?",
    qAr: "لماذا ظل جهاز الوصل الآلي معطّلًا ثلاثة أسابيع؟",
    options: [
      {
        en: "The spare part was never reordered after the last failure.",
        ar: "لم يُعَد طلب قطعة الغيار بعد العطل السابق.",
        correct: true,
        feedbackEn: "Good. One more why and you are at a system condition, not an event.",
        feedbackAr: "جيد. سؤال واحد آخر وتصل إلى حالة نظامية لا إلى حدث.",
      },
      {
        en: "Maintenance is too busy.",
        ar: "الصيانة مشغولة جدًا.",
        feedbackEn: "Capacity is a real constraint, but it explains everything and therefore nothing.",
        feedbackAr: "الطاقة قيد حقيقي، لكنه يفسّر كل شيء وبالتالي لا يفسّر شيئًا.",
      },
      {
        en: "Nobody complained about it.",
        ar: "لم يشتكِ أحد منه.",
        feedbackEn: "Close to something real — but silence is a symptom too. Keep going on the part itself.",
        feedbackAr: "قريب من شيء حقيقي — لكن الصمت عَرَض أيضًا. تابع على القطعة نفسها.",
      },
    ],
  },
  {
    qEn: "Why was the spare part never reordered?",
    qAr: "لماذا لم يُعَد طلب قطعة الغيار؟",
    options: [
      {
        en: "The splicer is not on the critical-spares list, so no min/max stock level exists for it.",
        ar: "جهاز الوصل غير مُدرج في قائمة قطع الغيار الحرجة، فلا يوجد له حد أدنى وأعلى للمخزون.",
        correct: true,
        feedbackEn: "That is the root cause: a missing system condition, not a missing person.",
        feedbackAr: "هذا هو السبب الجذري: حالة نظامية مفقودة، لا شخص مفقود.",
      },
      {
        en: "The storekeeper forgot.",
        ar: "أمين المستودع نسي.",
        feedbackEn: "A person's memory is never a root cause — it is the absence of a system that made memory the control.",
        feedbackAr: "ذاكرة شخص ليست سببًا جذريًا أبدًا — الجذر هو غياب النظام الذي جعل الذاكرة هي وسيلة الضبط.",
      },
      {
        en: "Procurement is slow.",
        ar: "المشتريات بطيئة.",
        feedbackEn: "Possibly true and completely unactionable as written. A root cause you can fix is specific.",
        feedbackAr: "قد يكون صحيحًا وغير قابل للتنفيذ بصياغته هذه. السبب الجذري القابل للإصلاح يكون محدّدًا.",
      },
    ],
  },
];

const CONCLUSION = {
  en: "Root cause: no min/max stock policy covers the splicer's spare. Systematic action: add it to the critical-spares list with a reorder point, and make the list part of the annual line review — so the next failure cannot stay open for three weeks.",
  ar: "السبب الجذري: لا توجد سياسة حد أدنى/أعلى للمخزون تغطي قطعة جهاز الوصل. الإجراء المنهجي: إدراجها في قائمة قطع الغيار الحرجة مع نقطة إعادة طلب، وجعل القائمة جزءًا من المراجعة السنوية للخط — حتى لا يبقى العطل القادم مفتوحًا ثلاثة أسابيع.",
};

export default function FiveWhys({ index }: { index: number }) {
  const { t, fill, locale } = useI18n();
  const isAr = locale === "ar";
  const [level, setLevel] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const game = t.playground.games.fiveWhys;
  const current = LEVELS[level];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (current.options[i].correct) setScore((s) => s + 1);
  }

  function next() {
    if (level + 1 >= LEVELS.length) {
      setDone(true);
      return;
    }
    setLevel((l) => l + 1);
    setPicked(null);
  }

  function restart() {
    setLevel(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  return (
    <GameShell
      id="fiveWhys"
      index={index}
      title={game.title}
      desc={game.desc}
      accent={ACCENT}
      score={score}
      total={LEVELS.length}
      onRestart={restart}
    >
      <div className="rounded-2xl border border-dune bg-sand/60 p-5">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-ink/65">
          {isAr ? "الحالة" : "The case"}
        </p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-abyss">{isAr ? SCENARIO.ar : SCENARIO.en}</p>
      </div>

      {done ? (
        <div className="mt-6 rounded-2xl border border-gold/45 bg-gold/8 p-6 text-center">
          <Trophy className="mx-auto h-9 w-9 text-gold" strokeWidth={1.4} />
          <p className="mt-4 font-display text-2xl font-semibold text-abyss">
            {fill(t.playground.yourScore, { score, total: LEVELS.length })}
          </p>
          <p className="mx-auto mt-4 flex max-w-xl items-start gap-3 text-start text-[0.9rem] leading-relaxed text-slate-ink">
            <Sprout className="mt-0.5 h-4 w-4 shrink-0 text-moss" strokeWidth={1.8} />
            {isAr ? CONCLUSION.ar : CONCLUSION.en}
          </p>
          <button type="button" onClick={restart} className="btn-outline mt-6">
            {t.playground.replay}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between gap-4">
            <ProgressDots total={LEVELS.length} current={level} accent={ACCENT} />
            <span className="font-mono text-[0.68rem] text-slate-ink/60">
              why {level + 1}/{LEVELS.length}
            </span>
          </div>

          <h3 className="mt-5 font-display text-[1.4rem] font-semibold text-abyss">
            {isAr ? current.qAr : current.qEn}
          </h3>

          <ul className="mt-5 space-y-3">
            {current.options.map((opt, i) => {
              const isPicked = picked === i;
              const reveal = picked !== null;
              const good = Boolean(opt.correct);
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    disabled={reveal}
                    className={`w-full rounded-2xl border p-5 text-start transition-all duration-400 disabled:cursor-default ${
                      reveal && good
                        ? "border-leaf bg-leaf/10"
                        : isPicked
                          ? "border-ember bg-ember/10"
                          : reveal
                            ? "border-dune bg-cream opacity-55"
                            : "border-dune bg-cream hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-lux"
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.6rem] font-bold ${
                          reveal && good
                            ? "border-leaf bg-leaf text-parchment"
                            : isPicked
                              ? "border-ember bg-ember text-parchment"
                              : "border-dune text-slate-ink"
                        }`}
                      >
                        {reveal ? (
                          good ? (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          ) : isPicked ? (
                            <X className="h-3 w-3" strokeWidth={3} />
                          ) : (
                            String.fromCharCode(65 + i)
                          )
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[0.93rem] leading-relaxed text-abyss">
                          {isAr ? opt.ar : opt.en}
                        </span>
                        {reveal && (isPicked || good) && (
                          <span className="mt-2 block text-[0.82rem] leading-relaxed text-slate-ink">
                            {isAr ? opt.feedbackAr : opt.feedbackEn}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {picked !== null && (
            <button type="button" onClick={next} className="btn-gold mt-6">
              {level + 1 >= LEVELS.length ? t.playground.finish : t.playground.next}
              <ArrowRight className="h-4 w-4 flip-x" strokeWidth={2} />
            </button>
          )}
        </>
      )}
    </GameShell>
  );
}
