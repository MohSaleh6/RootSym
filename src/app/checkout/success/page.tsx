import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { confirmEnrollmentPaid, getSetting } from "@/lib/enrollment";
import { formatJod } from "@/lib/money";
import SiteShell from "@/components/SiteShell";
import SuccessView from "./SuccessView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

type Search = { params?: never; searchParams: Promise<{ session_id?: string; ref?: string }> };

export default async function SuccessPage({ searchParams }: Search) {
  const { session_id: stripeSessionId, ref } = await searchParams;

  let enrollment = null;

  if (stripeSessionId) {
    enrollment = await prisma.enrollment.findUnique({
      where: { stripeSessionId },
      include: { course: true },
    });

    // The webhook is the source of truth, but it may not have landed yet —
    // verify straight with Stripe so the customer is never left waiting.
    if (enrollment && enrollment.status !== "PAID") {
      const stripe = getStripe();
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
          if (session.payment_status === "paid") {
            await confirmEnrollmentPaid(enrollment.id, {
              stripePaymentId:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
            });
            enrollment = await prisma.enrollment.findUnique({
              where: { id: enrollment.id },
              include: { course: true },
            });
          }
        } catch (error) {
          console.error("[success] could not verify Stripe session", error);
        }
      }
    }
  } else if (ref) {
    enrollment = await prisma.enrollment.findUnique({
      where: { reference: ref },
      include: { course: true },
    });
  }

  const paid = enrollment?.status === "PAID";
  const instructions = paid ? null : await getSetting("bank_transfer_instructions");

  return (
    <SiteShell>
      <SuccessView
        paid={paid}
        reference={enrollment?.reference ?? null}
        courseTitle={enrollment?.course.title ?? null}
        accessPath={enrollment ? `/access/${enrollment.accessToken}` : null}
        instructions={enrollment ? instructions : null}
        amount={enrollment ? formatJod(enrollment.amount) : null}
      />
    </SiteShell>
  );
}
