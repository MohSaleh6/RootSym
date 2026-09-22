/**
 * Profile content, sourced from Rand Saleh's CV.
 * Contact details live in siteConfig so they can be swapped for business
 * contacts without touching the rest of the site.
 */

export const siteConfig = {
  name: "RootSym",
  byline: "By Rand Saleh",
  tagline: "Root Cause Analysis & Systematic Actions",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "Rand.ali.saleh1@hotmail.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+962 7 9081 1983",
  phoneHref: (process.env.NEXT_PUBLIC_CONTACT_PHONE || "+962790811983").replace(/[^\d+]/g, ""),
  location: "Amman, Jordan",
  locationAr: "عمّان، الأردن",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  /**
   * Where a customer confirms a transfer. wa.me wants the number in full
   * international form with no plus and no spaces, so it is stored that way
   * and only ever formatted for display.
   */
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || "962790811983").replace(/[^\d]/g, ""),
  maxAttendees: 15,
};

/** A WhatsApp link, optionally pre-filled with the message we want to receive. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${siteConfig.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type ExperienceItem = {
  role: string;
  roleAr: string;
  company: string;
  companyAr: string;
  location: string;
  locationAr: string;
  start: string;
  end: string;
  current?: boolean;
  bullets: string[];
  bulletsAr: string[];
};

export const experience: ExperienceItem[] = [
  {
    role: "Integrated Work Systems (IWS) Coordinator → IWS Lead",
    roleAr: "منسّقة أنظمة العمل المتكاملة (IWS) ← قائدة أنظمة العمل المتكاملة",
    company: "Fine Hygienic Holding — Nuqul Group",
    companyAr: "فاين هايجينيك هولدنغ — مجموعة نقل",
    location: "Amman, Jordan",
    locationAr: "عمّان، الأردن",
    start: "06/2022",
    end: "01/2026",
    current: true,
    bullets: [
      "Led IWS strategy and continuous improvement programmes across the organisation.",
      "Drove process optimisation initiatives to improve efficiency, reduce waste and enhance productivity.",
      "Established and monitored KPIs to measure operational performance and identify improvement opportunities.",
      "Facilitated root cause analysis (RCA) and corrective action plans for operational issues.",
      "Coached and supported teams in applying continuous improvement tools and operational excellence standards.",
      "Conducted operational assessments and identified gaps against excellence frameworks.",
      "Trained and guided team members to maintain high productivity and performance metrics.",
      "Improved sustainability by coaching leaders on policy deployment implementation.",
      "Evaluated proposed project investments by conducting cost–benefit analysis.",
    ],
    bulletsAr: [
      "قيادة استراتيجية أنظمة العمل المتكاملة وبرامج التحسين المستمر على مستوى المؤسسة.",
      "قيادة مبادرات تحسين العمليات لرفع الكفاءة وتقليل الهدر وزيادة الإنتاجية.",
      "بناء مؤشرات الأداء ومتابعتها لقياس الأداء التشغيلي وتحديد فرص التحسين.",
      "تيسير جلسات تحليل الأسباب الجذرية (RCA) وخطط الإجراءات التصحيحية للمشكلات التشغيلية.",
      "تدريب الفرق ودعمها في تطبيق أدوات التحسين المستمر ومعايير التميّز التشغيلي.",
      "تنفيذ تقييمات تشغيلية وتحديد الفجوات مقارنةً بأطر التميّز.",
      "تدريب أعضاء الفريق وتوجيههم للحفاظ على إنتاجية ومؤشرات أداء عالية.",
      "تعزيز الاستدامة عبر تدريب القادة على تطبيق نشر السياسات.",
      "تقييم الاستثمارات المقترحة للمشاريع من خلال تحليل التكلفة مقابل العائد.",
    ],
  },
  {
    role: "Senior Lean Industrial Engineer",
    roleAr: "مهندسة صناعية أولى — لين",
    company: "Pinetree Company for Textile Manufacturing PSC — Nike",
    companyAr: "شركة باين تري لصناعة المنسوجات — نايكي",
    location: "Al-Muaqar, Amman",
    locationAr: "الموقر، عمّان",
    start: "06/2021",
    end: "06/2022",
    bullets: [
      "Identified the opportunities to improve across different areas of the operation.",
      "Applied Lean tools and methods systematically in order to achieve operational excellence.",
      "Initiated improvement guidelines for departments to engage them in the continuous improvement journey.",
      "Led root cause analysis to identify and address problems in industrial production.",
    ],
    bulletsAr: [
      "تحديد فرص التحسين عبر مجالات مختلفة من العمليات.",
      "تطبيق أدوات ومنهجيات لين بشكل منهجي للوصول إلى التميّز التشغيلي.",
      "إطلاق إرشادات التحسين للأقسام لإشراكها في رحلة التحسين المستمر.",
      "قيادة تحليل الأسباب الجذرية لتحديد ومعالجة مشكلات الإنتاج الصناعي.",
    ],
  },
  {
    role: "Lean Industrial Engineer",
    roleAr: "مهندسة صناعية — لين",
    company: "Pinetree Company for Textile Manufacturing PSC — Nike",
    companyAr: "شركة باين تري لصناعة المنسوجات — نايكي",
    location: "Al-Muaqar, Amman",
    locationAr: "الموقر، عمّان",
    start: "07/2019",
    end: "06/2021",
    bullets: [
      "Identified issues, analysed information and provided solutions to problems that led to cost saving and customer satisfaction.",
      "Collaborated with cross-functional teams to develop and implement process changes.",
      "Performed data analysis and deep investigation of production losses.",
    ],
    bulletsAr: [
      "تحديد المشكلات وتحليل المعلومات وتقديم حلول أدّت إلى توفير التكاليف ورضا العملاء.",
      "التعاون مع فرق متعددة التخصصات لتطوير وتنفيذ تغييرات على العمليات.",
      "تنفيذ تحليل البيانات والتحقيق العميق في خسائر الإنتاج.",
    ],
  },
  {
    role: "Operational Excellence Trainee",
    roleAr: "متدربة التميّز التشغيلي",
    company: "Hikma Pharmaceuticals",
    companyAr: "حكمة للصناعات الدوائية",
    location: "Amman, Jordan",
    locationAr: "عمّان، الأردن",
    start: "06/2018",
    end: "08/2018",
    bullets: [
      "Supported operational excellence projects inside a regulated pharmaceutical environment.",
    ],
    bulletsAr: [
      "دعم مشاريع التميّز التشغيلي داخل بيئة دوائية خاضعة للتنظيم.",
    ],
  },
];

export const education = [
  {
    degree: "B.Sc. Industrial Engineering",
    degreeAr: "بكالوريوس الهندسة الصناعية",
    school: "Jordan University of Science and Technology",
    schoolAr: "جامعة العلوم والتكنولوجيا الأردنية",
    location: "Irbid, Jordan",
    locationAr: "إربد، الأردن",
    note: "GPA 3.77 — Excellent",
    noteAr: "المعدل التراكمي ٣٫٧٧ — امتياز",
  },
];

export const certifications = [
  {
    title: "Basic Lean Training — 22 hours",
    titleAr: "التدريب الأساسي على لين — ٢٢ ساعة",
    issuer: "NOS Training, Ramatex Group",
    issuerAr: "NOS Training — مجموعة راماتكس",
  },
  {
    title: "Special Topics in Industrial Engineering — 6 hours",
    titleAr: "مواضيع خاصة في الهندسة الصناعية — ٦ ساعات",
    issuer: "Jordan Engineers Association",
    issuerAr: "نقابة المهندسين الأردنيين",
  },
];

export const skills = [
  { en: "Problem Solving Techniques", ar: "أساليب حل المشكلات" },
  { en: "Root Cause Analysis", ar: "تحليل الأسباب الجذرية" },
  { en: "Critical Thinking", ar: "التفكير النقدي" },
  { en: "Lean Manufacturing", ar: "التصنيع الرشيق (لين)" },
  { en: "Integrated Work Systems", ar: "أنظمة العمل المتكاملة" },
  { en: "Training and Development", ar: "التدريب والتطوير" },
  { en: "Attention to Detail", ar: "الدقة في التفاصيل" },
  { en: "Excellent Communication", ar: "تواصل ممتاز" },
  { en: "Leadership Skills", ar: "مهارات القيادة" },
  { en: "Teamwork and Collaboration", ar: "العمل الجماعي والتعاون" },
  { en: "Power BI", ar: "باور بي آي" },
  { en: "AutoCAD", ar: "أوتوكاد" },
  { en: "MS Office", ar: "مايكروسوفت أوفيس" },
];

export const spokenLanguages = [
  { en: "Arabic — native", ar: "العربية — اللغة الأم" },
  { en: "English — professional", ar: "الإنجليزية — مستوى احترافي" },
];
