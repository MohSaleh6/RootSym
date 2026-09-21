import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import SuccessView from "./SuccessView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

type Search = { params?: never; searchParams: Promise<{ ref?: string }> };

export default async function SuccessPage({ searchParams }: Search) {
  const { ref } = await searchParams;

  const enrollment = ref
    ? await prisma.enrollment.findUnique({ where: { reference: ref }, include: { course: true } })
    : null;

  // Anything not yet paid belongs on the payment page, which carries the
  // transfer details and the "I have sent it" step.
  if (enrollment && enrollment.status !== "PAID") {
    redirect(`/checkout/confirm/${enrollment.accessToken}`);
  }

  const paid = enrollment?.status === "PAID";

  return (
    <SiteShell>
      <SuccessView
        paid={paid}
        reference={enrollment?.reference ?? null}
        courseTitle={enrollment?.course.title ?? null}
        accessPath={enrollment ? `/access/${enrollment.accessToken}` : null}
        instructions={null}
        amountFils={enrollment?.amount ?? null}
      />
    </SiteShell>
  );
}
