import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import AboutView from "./AboutView";

export const metadata: Metadata = {
  title: "About Rand Saleh",
  description:
    "Rand Saleh — Industrial Engineer and Operational Excellence professional. Seven years leading Integrated Work Systems, Lean deployment and root cause analysis in manufacturing.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <AboutView />
    </SiteShell>
  );
}
