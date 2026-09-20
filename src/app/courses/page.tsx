import type { Metadata } from "next";
import { getCourses } from "@/lib/courses";
import SiteShell from "@/components/SiteShell";
import CoursesView from "./CoursesView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workshops",
  description:
    "Live eight-hour operational excellence workshops on Microsoft Teams, capped at 15 attendees. Root Cause Analysis, loss elimination and Lean foundations by Rand Saleh.",
};

export default async function CoursesPage() {
  const courses = await getCourses();
  return (
    <SiteShell>
      <CoursesView courses={courses} />
    </SiteShell>
  );
}
