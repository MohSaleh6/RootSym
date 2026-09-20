import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminTitle } from "../../ui";
import CourseForm, { type CourseFormValue } from "../CourseForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit workshop" };

type Params = { params: Promise<{ id: string }> };

export default async function EditCoursePage({ params }: Params) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  const initial: CourseFormValue = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    titleAr: course.titleAr ?? "",
    tagline: course.tagline,
    taglineAr: course.taglineAr ?? "",
    summary: course.summary,
    summaryAr: course.summaryAr ?? "",
    description: course.description,
    descriptionAr: course.descriptionAr ?? "",
    imageUrl: course.imageUrl ?? "",
    durationHours: course.durationHours,
    deliveryMode: course.deliveryMode,
    level: course.level,
    languageOfDelivery: course.languageOfDelivery,
    priceIndividual: course.priceIndividual,
    priceCompany: course.priceCompany,
    maxAttendees: course.maxAttendees,
    outcomes: course.outcomes.length ? course.outcomes : [""],
    outcomesAr: course.outcomesAr,
    audience: course.audience.length ? course.audience : [""],
    audienceAr: course.audienceAr,
    tools: course.tools.length ? course.tools : [""],
    modules: (course.modules as unknown as CourseFormValue["modules"]) ?? [],
    faqs: (course.faqs as unknown as CourseFormValue["faqs"]) ?? [],
    teamsLink: course.teamsLink ?? "",
    accentColor: course.accentColor,
    icon: course.icon,
    featured: course.featured,
    published: course.published,
    sortOrder: course.sortOrder,
  };

  return (
    <div className="space-y-8">
      <AdminTitle
        title={course.title}
        subtitle="Changes go live the moment you save."
        action={
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="btn-outline !py-2.5 !text-[0.82rem]"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.9} />
            View on site
          </Link>
        }
      />
      <CourseForm initial={initial} />
    </div>
  );
}
