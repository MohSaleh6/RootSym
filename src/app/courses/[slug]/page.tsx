import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/courses";
import SiteShell from "@/components/SiteShell";
import CourseView from "./CourseView";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Workshop not found" };
  return {
    title: course.title,
    description: course.summary.slice(0, 180),
    openGraph: {
      title: course.title,
      description: course.summary.slice(0, 180),
      images: course.imageUrl ? [course.imageUrl] : undefined,
    },
  };
}

export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  return (
    <SiteShell>
      <CourseView course={course} />
    </SiteShell>
  );
}
