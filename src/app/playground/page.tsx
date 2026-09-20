import type { Metadata } from "next";
import { getCourses } from "@/lib/courses";
import SiteShell from "@/components/SiteShell";
import PlaygroundView from "./PlaygroundView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Five free interactive activities that drill root cause analysis: the Five Whys, a fishbone builder, root-vs-symptom classification, a timed waste hunt and a Pareto focus exercise.",
};

export default async function PlaygroundPage() {
  const courses = await getCourses();
  const featured = courses.find((c) => c.featured) ?? courses[0] ?? null;

  return (
    <SiteShell>
      <PlaygroundView courseSlug={featured?.slug ?? null} />
    </SiteShell>
  );
}
