import "server-only";
import { prisma } from "./prisma";

export type CourseModule = {
  title: string;
  titleAr?: string;
  clock?: string;
  points: string[];
  pointsAr?: string[];
};

export type CourseFaq = {
  q: string;
  a: string;
  qAr?: string;
  aAr?: string;
};

export type SessionDTO = {
  id: string;
  title: string | null;
  startsAt: string;
  timezone: string;
  seatsTotal: number;
  seatsLeft: number;
  status: string;
};

export type CourseDTO = {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  tagline: string;
  taglineAr: string | null;
  summary: string;
  summaryAr: string | null;
  description: string;
  descriptionAr: string | null;
  imageUrl: string | null;
  durationHours: number;
  deliveryMode: string;
  level: string;
  languageOfDelivery: string;
  priceIndividual: number;
  priceCompany: number;
  maxAttendees: number;
  outcomes: string[];
  outcomesAr: string[];
  audience: string[];
  audienceAr: string[];
  tools: string[];
  modules: CourseModule[];
  faqs: CourseFaq[];
  accentColor: string;
  icon: string;
  featured: boolean;
  sessions: SessionDTO[];
};

type CourseWithSessions = Awaited<ReturnType<typeof fetchCourses>>[number];

function fetchCourses() {
  return prisma.course.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      sessions: {
        where: { startsAt: { gte: new Date() }, status: { in: ["OPEN", "SCHEDULED"] } },
        orderBy: { startsAt: "asc" },
        include: { _count: { select: { enrollments: true } } },
      },
    },
  });
}

function toDTO(course: CourseWithSessions): CourseDTO {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    titleAr: course.titleAr,
    tagline: course.tagline,
    taglineAr: course.taglineAr,
    summary: course.summary,
    summaryAr: course.summaryAr,
    description: course.description,
    descriptionAr: course.descriptionAr,
    imageUrl: course.imageUrl,
    durationHours: course.durationHours,
    deliveryMode: course.deliveryMode,
    level: course.level,
    languageOfDelivery: course.languageOfDelivery,
    priceIndividual: course.priceIndividual,
    priceCompany: course.priceCompany,
    maxAttendees: course.maxAttendees,
    outcomes: course.outcomes,
    outcomesAr: course.outcomesAr,
    audience: course.audience,
    audienceAr: course.audienceAr,
    tools: course.tools,
    modules: (course.modules as unknown as CourseModule[]) ?? [],
    faqs: (course.faqs as unknown as CourseFaq[]) ?? [],
    accentColor: course.accentColor,
    icon: course.icon,
    featured: course.featured,
    sessions: course.sessions.map((s) => ({
      id: s.id,
      title: s.title,
      startsAt: s.startsAt.toISOString(),
      timezone: s.timezone,
      seatsTotal: s.seatsTotal,
      seatsLeft: Math.max(0, s.seatsTotal - s._count.enrollments),
      status: s.status,
    })),
  };
}

export async function getCourses(): Promise<CourseDTO[]> {
  try {
    const rows = await fetchCourses();
    return rows.map(toDTO);
  } catch (error) {
    console.error("[courses] could not load courses", error);
    return [];
  }
}

export async function getCourse(slug: string): Promise<CourseDTO | null> {
  try {
    const rows = await fetchCourses();
    return rows.map(toDTO).find((c) => c.slug === slug) ?? null;
  } catch (error) {
    console.error("[courses] could not load course", error);
    return null;
  }
}
