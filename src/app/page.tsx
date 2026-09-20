import { getCourses } from "@/lib/courses";
import SiteShell from "@/components/SiteShell";
import Hero from "@/components/sections/Hero";
import LossEquation from "@/components/sections/LossEquation";
import ToolsMarquee from "@/components/sections/ToolsMarquee";
import SignatureCourse from "@/components/sections/SignatureCourse";
import CoursesPreview from "@/components/sections/CoursesPreview";
import PlaygroundTeaser from "@/components/sections/PlaygroundTeaser";
import AboutTeaser from "@/components/sections/AboutTeaser";
import CtaBand from "@/components/sections/CtaBand";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await getCourses();
  const signature = courses.find((c) => c.featured) ?? courses[0] ?? null;
  const rest = signature ? courses.filter((c) => c.id !== signature.id) : courses;

  return (
    <SiteShell>
      <Hero />
      <LossEquation />
      <ToolsMarquee />
      {signature && <SignatureCourse course={signature} />}
      {rest.length > 0 && <CoursesPreview courses={rest} />}
      <PlaygroundTeaser />
      <AboutTeaser />
      <CtaBand href={signature ? `/checkout/${signature.slug}?type=company` : "/courses"} />
    </SiteShell>
  );
}
