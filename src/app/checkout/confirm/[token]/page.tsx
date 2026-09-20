import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getPaymentDetails, paymentRows } from "@/lib/payments";
import { getSetting } from "@/lib/enrollment";
import SiteShell from "@/components/SiteShell";
import ConfirmView, { type ConfirmState } from "./ConfirmView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Complete your payment",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ token: string }> };

export default async function ConfirmPage({ params }: Params) {
  const { token } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { accessToken: token },
    include: { course: { select: { title: true, titleAr: true } } },
  });

  let state: ConfirmState = "awaiting";
  if (!enrollment) state = "not_found";
  else if (enrollment.status === "PAID") state = "paid";
  else if (enrollment.status === "CANCELLED" || enrollment.status === "REFUNDED") state = "cancelled";
  else if (enrollment.status === "AWAITING_REVIEW") state = "under_review";

  const details = await getPaymentDetails();
  const legacy = await getSetting("bank_transfer_instructions");

  return (
    <SiteShell>
      <ConfirmView
        token={token}
        state={state}
        reference={enrollment?.reference ?? null}
        courseTitle={enrollment?.course.title ?? null}
        amountFils={enrollment?.amount ?? null}
        rows={paymentRows(details)}
        notes={details.notes || legacy}
        notesAr={details.notesAr}
        holdExpiresAt={enrollment?.holdExpiresAt?.toISOString() ?? null}
        accessPath={enrollment ? `/access/${enrollment.accessToken}` : null}
      />
    </SiteShell>
  );
}
