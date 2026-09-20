import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL } from "@/content/legal";
import SiteShell from "@/components/SiteShell";
import LegalView from "./LegalView";

type Params = { params: Promise<{ doc: string }> };

export function generateStaticParams() {
  return Object.keys(LEGAL).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { doc } = await params;
  const entry = LEGAL[doc];
  return { title: entry ? entry.title.en : "Not found" };
}

export default async function LegalPage({ params }: Params) {
  const { doc } = await params;
  const entry = LEGAL[doc];
  if (!entry) notFound();

  return (
    <SiteShell>
      <LegalView doc={entry} />
    </SiteShell>
  );
}
