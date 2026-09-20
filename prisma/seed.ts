import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const RCA = {
  slug: "root-cause-analysis",
  title: "Root Cause Analysis — Eliminate the Loss, Not the Symptom",
  titleAr: "تحليل الأسباب الجذرية — اقضِ على الخسارة لا على العَرَض",
  tagline: "Teach your team to kill the problem where it actually lives",
  taglineAr: "علّم فريقك أن يقتل المشكلة حيث تعيش فعلًا",
  summary:
    "An eight-hour live intensive that takes a team from a vague complaint to a verified root cause and a systematic action plan they can defend in front of any leadership team. Built from seven years of eliminating losses on real production lines — not from a textbook.",
  summaryAr:
    "ورشة مكثّفة مباشرة مدّتها ثماني ساعات تنقل الفريق من شكوى غامضة إلى سبب جذري مُثبَت وخطة إجراءات منهجية يستطيع الدفاع عنها أمام أي إدارة. مبنيّة على سبع سنوات من القضاء على الخسائر في خطوط إنتاج حقيقية — لا من كتاب.",
  description: `Most teams are extremely good at reacting. A line stops, the crew swarms it, the line restarts, and everybody moves on. Three weeks later the same line stops for the same reason — and nobody calls that a failure of the investigation, because there never really was one.

Root Cause Analysis is the discipline that ends that cycle. Over eight live hours we take your people through the complete chain: frame the loss in numbers, collect evidence before it evaporates, map every plausible cause, drill past the comfortable answer, prove the root cause instead of asserting it, then design countermeasures that are written into the standard so the loss cannot quietly grow back.

This is not a lecture. Every hour ends with the group doing the work on a real case — and in a company room, that case is one of your own losses. Participants leave with completed templates, a one-page A3 they have actually written, and a routine their team can run the following Monday without any further support.`,
  descriptionAr: `معظم الفرق بارعة جدًا في ردّ الفعل. يتوقف الخط، يتجمّع الفريق حوله، يعود الخط للعمل، ويمضي الجميع. وبعد ثلاثة أسابيع يتوقّف الخط نفسه للسبب نفسه — ولا يسمّي أحد ذلك فشلًا في التحقيق، لأنه لم يكن هناك تحقيق حقيقي من الأساس.

تحليل الأسباب الجذرية هو الانضباط الذي ينهي هذه الدورة. على مدى ثماني ساعات مباشرة نأخذ فريقك عبر السلسلة كاملة: صياغة الخسارة بالأرقام، وجمع الأدلة قبل أن تتبخّر، ورسم كل سبب محتمل، والتعمّق إلى ما بعد الإجابة المريحة، وإثبات السبب الجذري بدل ادّعائه، ثم تصميم إجراءات مضادة تُكتب داخل المعيار حتى لا تعود الخسارة للنمو بصمت.

هذه ليست محاضرة. كل ساعة تنتهي بعمل جماعي على حالة حقيقية — وفي قاعة الشركة تكون تلك الحالة واحدة من خسائركم أنتم. يخرج المشاركون بقوالب مكتملة، وورقة A3 كتبوها بأنفسهم، وروتين يستطيع فريقهم تشغيله صباح الاثنين التالي دون أي دعم إضافي.`,
  durationHours: 8,
  deliveryMode: "Live on Microsoft Teams",
  level: "All levels — no prior Lean experience required",
  languageOfDelivery: "English (Arabic on request)",
  priceIndividual: 85_000,
  priceCompany: 900_000,
  maxAttendees: 15,
  accentColor: "#2e86ab",
  icon: "target",
  featured: true,
  published: true,
  sortOrder: 0,
  outcomes: [
    "Write a problem statement in numbers that a plant manager cannot argue with.",
    "Separate symptom, cause and root cause under real time pressure.",
    "Run a Five Whys that goes deeper instead of sideways — and know exactly when to stop.",
    "Build a cause-and-effect tree that survives a hostile challenge.",
    "Verify a root cause with evidence instead of defending it with opinion.",
    "Choose countermeasures that the next shift cannot quietly undo.",
    "Write a one-page A3 and present it to leadership in five minutes.",
    "Install the audit routine that stops the loss from growing back.",
  ],
  outcomesAr: [
    "صياغة وصف المشكلة بالأرقام بحيث لا يستطيع مدير المصنع الجدال فيه.",
    "الفصل بين العَرَض والسبب والسبب الجذري تحت ضغط الوقت الحقيقي.",
    "تشغيل تمرين الأسباب الخمسة بعمق لا بتفرّع — ومعرفة متى يجب التوقف بالضبط.",
    "بناء شجرة سبب-وأثر تصمد أمام أي تحدٍّ صارم.",
    "إثبات السبب الجذري بالأدلة بدل الدفاع عنه بالرأي.",
    "اختيار إجراءات مضادة لا تستطيع الوردية التالية التراجع عنها بصمت.",
    "كتابة ورقة A3 من صفحة واحدة وتقديمها للإدارة في خمس دقائق.",
    "تركيب روتين التدقيق الذي يمنع الخسارة من العودة للنمو.",
  ],
  audience: [
    "Production, quality and maintenance engineers",
    "Line leaders, supervisors and shift managers",
    "Continuous improvement and operational excellence teams",
    "Anyone who owns a KPI that keeps missing its target",
  ],
  audienceAr: [
    "مهندسو الإنتاج والجودة والصيانة",
    "قادة الخطوط والمشرفون ومديرو الورديات",
    "فرق التحسين المستمر والتميّز التشغيلي",
    "كل من يملك مؤشر أداء يستمر في تفويت هدفه",
  ],
  tools: [
    "Is / Is-Not",
    "Ishikawa (6M)",
    "Five Whys",
    "Loss Tree",
    "Pareto",
    "Fault Tree",
    "A3",
    "Poka-Yoke",
    "PDCA",
    "Standard Work",
  ],
  modules: [
    {
      clock: "Hour 1",
      title: "Frame the loss, not the feeling",
      titleAr: "صِغ الخسارة لا الانطباع",
      points: [
        "Turn a complaint into a measurable problem statement",
        "Is / Is-Not: draw the boundary around the failure",
        "Quantify the loss in money, time and units",
      ],
      pointsAr: [
        "تحويل الشكوى إلى وصف مشكلة قابل للقياس",
        "أداة Is / Is-Not: رسم حدود الخلل",
        "قياس الخسارة بالمال والوقت والوحدات",
      ],
    },
    {
      clock: "Hour 2",
      title: "Go and see before the evidence evaporates",
      titleAr: "اذهب وشاهد قبل أن تتبخّر الأدلة",
      points: [
        "Gemba discipline: what to capture in the first thirty minutes",
        "Preserving the failure state instead of resetting it",
        "Interviewing operators without leading the answer",
      ],
      pointsAr: [
        "انضباط الجيمبا: ما الذي يجب توثيقه في أول ثلاثين دقيقة",
        "الحفاظ على حالة الخلل بدل إعادة التشغيل فورًا",
        "مقابلة المشغّلين دون توجيه الإجابة",
      ],
    },
    {
      clock: "Hour 3",
      title: "Map every plausible cause",
      titleAr: "ارسم كل سبب محتمل",
      points: [
        "Ishikawa done properly: the six M categories",
        "Cause-and-effect logic trees",
        "Separating correlation from causation",
      ],
      pointsAr: [
        "مخطط إيشيكاوا بشكل صحيح: فئات الميم الست",
        "أشجار منطق السبب والأثر",
        "الفصل بين الارتباط والسببية",
      ],
    },
    {
      clock: "Hour 4",
      title: "Drill past the comfortable answer",
      titleAr: "تعمّق إلى ما بعد الإجابة المريحة",
      points: [
        "The three traps that make a Five Whys fail",
        "Branching whys: when one answer has two parents",
        "The stop rule — how you know you have hit the root",
      ],
      pointsAr: [
        "الفخاخ الثلاثة التي تُفشل تمرين الأسباب الخمسة",
        "الأسباب المتفرّعة: حين يكون للإجابة الواحدة سببان",
        "قاعدة التوقّف — كيف تعرف أنك وصلت إلى الجذر",
      ],
    },
    {
      clock: "Hour 5",
      title: "Prove it, do not assert it",
      titleAr: "أثبِته ولا تدّعِه",
      points: [
        "Turn-it-on / turn-it-off verification",
        "Pareto and data checks that confirm or kill a hypothesis",
        "Writing the falsification test before you run it",
      ],
      pointsAr: [
        "التحقق عبر التشغيل والإيقاف المتعمّد",
        "باريتو وفحوصات البيانات التي تؤكد الفرضية أو تُسقطها",
        "كتابة اختبار الدحض قبل تنفيذه",
      ],
    },
    {
      clock: "Hour 6",
      title: "Design systematic actions",
      titleAr: "صمّم الإجراءات المنهجية",
      points: [
        "Containment vs corrective vs systemic action",
        "The countermeasure hierarchy — why training is the weakest fix",
        "Poka-yoke and standard work that hold without supervision",
      ],
      pointsAr: [
        "الاحتواء مقابل الإجراء التصحيحي مقابل الإجراء النظامي",
        "هرم الإجراءات المضادة — ولماذا التدريب هو أضعف حل",
        "بوكا-يوكي والعمل المعياري الذي يصمد دون إشراف",
      ],
    },
    {
      clock: "Hour 7",
      title: "Live case — your own loss",
      titleAr: "حالة حيّة — خسارتكم أنتم",
      points: [
        "The full chain applied end to end by the group",
        "Coaching on the real data you brought",
        "Peer challenge: defend your root cause",
      ],
      pointsAr: [
        "تطبيق السلسلة كاملة من البداية للنهاية بشكل جماعي",
        "تدريب مباشر على بياناتكم الحقيقية",
        "تحدٍّ من الأقران: دافع عن سببك الجذري",
      ],
    },
    {
      clock: "Hour 8",
      title: "Make it stick",
      titleAr: "اجعلها تدوم",
      points: [
        "Ownership, KPI and audit routine",
        "The one-page A3 you will actually use",
        "Presenting the investigation to leadership in five minutes",
      ],
      pointsAr: [
        "الملكية ومؤشر الأداء وروتين التدقيق",
        "ورقة A3 من صفحة واحدة ستستخدمها فعلًا",
        "تقديم التحقيق للإدارة في خمس دقائق",
      ],
    },
  ],
  faqs: [
    {
      q: "Do we need prior Lean or Six Sigma experience?",
      a: "No. The workshop starts from the problem, not from the jargon. Experienced practitioners get depth in hours 4–6; newcomers get a complete, usable method by hour 8.",
      qAr: "هل نحتاج خبرة سابقة في لين أو ستة سيجما؟",
      aAr: "لا. تبدأ الورشة من المشكلة لا من المصطلحات. يجد الممارسون ذوو الخبرة عمقًا في الساعات ٤–٦، ويخرج المبتدئون بمنهجية كاملة وقابلة للاستخدام بحلول الساعة الثامنة.",
    },
    {
      q: "Is the session recorded?",
      a: "The workshop is deliberately live and interactive — the value is in the coaching, the challenge and the group work. Templates, canvases and the workbook are yours to keep.",
      qAr: "هل تُسجَّل الجلسة؟",
      aAr: "الورشة مباشرة وتفاعلية عن قصد — القيمة في التدريب والتحدي والعمل الجماعي. أما القوالب واللوحات والدليل فتبقى ملكًا لكم.",
    },
    {
      q: "Can we work on our own production data?",
      a: "Yes — that is exactly what a company room is for. Send the loss you want to attack when you book and it is built into hours 7 and 8.",
      qAr: "هل يمكننا العمل على بيانات إنتاجنا الحقيقية؟",
      aAr: "نعم — وهذا بالضبط الغرض من قاعة الشركة. أرسلوا الخسارة التي تريدون مهاجمتها عند الحجز وسنبنيها داخل الساعتين السابعة والثامنة.",
    },
    {
      q: "What do we need to join?",
      a: "Microsoft Teams, a working microphone and one hour of preparation reading sent three days before. A camera is strongly encouraged — the group work depends on it.",
      qAr: "ما الذي نحتاجه للانضمام؟",
      aAr: "مايكروسوفت تيمز، وميكروفون يعمل، وساعة من القراءة التحضيرية تُرسل قبل ثلاثة أيام. ونشجّع بشدة على تشغيل الكاميرا — فالعمل الجماعي يعتمد عليها.",
    },
    {
      q: "Is there a certificate?",
      a: "Yes. Every participant who completes the eight hours receives a RootSym certificate of completion.",
      qAr: "هل توجد شهادة؟",
      aAr: "نعم. كل مشارك يُكمل الساعات الثماني يحصل على شهادة إتمام من روت سيم.",
    },
    {
      q: "How does the joining link work?",
      a: "The moment your payment clears you receive a personal joining page. It opens once and reveals the Microsoft Teams link — so save it straight to your calendar.",
      qAr: "كيف يعمل رابط الدخول؟",
      aAr: "فور تأكيد الدفع تصلك صفحة دخول شخصية. تُفتح مرة واحدة وتكشف رابط مايكروسوفت تيمز — لذا احفظه مباشرة في تقويمك.",
    },
  ],
};

const DRAFTS = [
  {
    slug: "loss-elimination-oee",
    title: "Loss Elimination & OEE — Find the Hours You Are Already Paying For",
    titleAr: "القضاء على الخسائر و OEE — اعثر على الساعات التي تدفع ثمنها بالفعل",
    tagline: "Turn a loss tree into a funded improvement plan",
    taglineAr: "حوّل شجرة الخسائر إلى خطة تحسين ممولة",
    summary:
      "Build the loss tree for a line, calculate true OEE, and convert the biggest gaps into a prioritised, costed improvement plan.",
    summaryAr:
      "ابنِ شجرة الخسائر لخط إنتاج، واحسب الكفاءة الإجمالية الحقيقية، وحوّل أكبر الفجوات إلى خطة تحسين مُرتّبة ومُسعّرة.",
    description:
      "An eight-hour live workshop on measuring what is actually being lost, building a complete loss tree, and turning it into an improvement plan with owners, costs and deadlines.",
    descriptionAr:
      "ورشة مباشرة مدّتها ثماني ساعات حول قياس ما يُفقد فعليًا، وبناء شجرة خسائر كاملة، وتحويلها إلى خطة تحسين لها أصحاب وتكاليف ومواعيد.",
    priceIndividual: 85_000,
    priceCompany: 900_000,
    accentColor: "#2f6b4f",
    icon: "chart",
    sortOrder: 1,
  },
  {
    slug: "lean-foundations-waste-walk",
    title: "Lean Foundations & the Waste Walk",
    titleAr: "أساسيات لين وجولة الهدر",
    tagline: "See the eight wastes on your own floor",
    taglineAr: "شاهد أنواع الهدر الثمانية في مصنعك أنت",
    summary:
      "The practical entry point to Lean: the eight wastes, standard work, 5S that survives, and a structured waste walk your team can repeat weekly.",
    summaryAr:
      "المدخل العملي إلى لين: أنواع الهدر الثمانية، والعمل المعياري، و5S التي تصمد، وجولة هدر منظّمة يمكن لفريقك تكرارها أسبوعيًا.",
    description:
      "An eight-hour live foundation workshop covering the eight wastes, standard work, 5S and a repeatable waste walk routine.",
    descriptionAr:
      "ورشة تأسيسية مباشرة مدّتها ثماني ساعات تغطي أنواع الهدر الثمانية والعمل المعياري و5S وروتين جولة هدر قابل للتكرار.",
    priceIndividual: 70_000,
    priceCompany: 780_000,
    accentColor: "#c9a227",
    icon: "workflow",
    sortOrder: 2,
  },
];

async function main() {
  const rca = await prisma.course.upsert({
    where: { slug: RCA.slug },
    update: RCA,
    create: RCA,
  });
  console.log(`✓ course: ${rca.slug}`);

  for (const draft of DRAFTS) {
    const row = await prisma.course.upsert({
      where: { slug: draft.slug },
      update: {},
      create: {
        ...draft,
        durationHours: 8,
        maxAttendees: 15,
        published: false,
        featured: false,
        outcomes: [],
        outcomesAr: [],
        audience: [],
        audienceAr: [],
        tools: [],
        modules: [],
        faqs: [],
      },
    });
    console.log(`✓ draft course: ${row.slug}`);
  }

  const existingSessions = await prisma.courseSession.count({ where: { courseId: rca.id } });
  if (existingSessions === 0) {
    const first = new Date();
    first.setDate(first.getDate() + 21);
    first.setHours(9, 0, 0, 0);
    const second = new Date(first);
    second.setDate(second.getDate() + 28);

    await prisma.courseSession.createMany({
      data: [
        { courseId: rca.id, title: "Open cohort — Autumn", startsAt: first, seatsTotal: 15 },
        { courseId: rca.id, title: "Open cohort — Winter", startsAt: second, seatsTotal: 15 },
      ],
    });
    console.log("✓ two open cohorts scheduled");
  }

  const settings: Record<string, string> = {
    bank_transfer_instructions: [
      "Bank: (add your bank name)",
      "Account name: Rand Saleh",
      "IBAN: (add your IBAN)",
      "CliQ alias: (add your CliQ alias)",
      "",
      "Please put your booking reference in the transfer note, then reply to this email with a screenshot of the transfer.",
    ].join("\n"),
    bank_transfer_instructions_ar: [
      "البنك: (أضف اسم البنك)",
      "اسم الحساب: رند صالح",
      "الآيبان: (أضف رقم الآيبان)",
      "اسم كليك: (أضف اسم كليك)",
      "",
      "يرجى كتابة رقم حجزك في ملاحظة التحويل، ثم الرد على هذه الرسالة بصورة من إشعار التحويل.",
    ].join("\n"),
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log("✓ site settings");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
