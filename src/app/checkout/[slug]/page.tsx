import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/courses";
import { cardPaymentsEnabled } from "@/lib/payments";
import { getCurrentUser } from "@/lib/user-auth";
import SiteShell from "@/components/SiteShell";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reserve a seat", robots: { index: false } };

type Params = { params: Promise<{ slug: string }> };

export default async function CheckoutPage({ params }: Params) {
  const { slug } = await params;
  const [course, user] = await Promise.all([getCourse(slug), getCurrentUser()]);
  if (!course) notFound();

  return (
    <SiteShell overDark={false}>
      <Suspense fallback={<div className="min-h-screen bg-cream" />}>
        <CheckoutForm
          course={course}
          cardReady={cardPaymentsEnabled()}
          account={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  phone: user.phone ?? "",
                  organisation: user.organisation ?? "",
                  jobTitle: user.jobTitle ?? "",
                }
              : null
          }
        />
      </Suspense>
    </SiteShell>
  );
}
