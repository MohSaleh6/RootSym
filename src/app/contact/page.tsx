import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import ContactView from "./ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to Rand Saleh about a private RootSym workshop for your team, a tailored programme, or the method itself.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <ContactView />
    </SiteShell>
  );
}
