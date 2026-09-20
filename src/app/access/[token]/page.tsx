import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SiteShell from "@/components/SiteShell";
import AccessView, { type AccessState } from "./AccessView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your live session",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ token: string }> };

export default async function AccessPage({ params }: Params) {
  const { token } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { accessToken: token },
    include: { course: true, session: true },
  });

  let state: AccessState = "ready";
  if (!enrollment) state = "not_found";
  else if (enrollment.accessRevoked) state = "revoked";
  else if (enrollment.status !== "PAID") state = "pending";
  else if (enrollment.accessOpenedAt) state = "used";

  return (
    <SiteShell>
      <AccessView
        token={token}
        initialState={state}
        courseTitle={enrollment?.course.title ?? null}
        reference={enrollment?.reference ?? null}
        startsAt={enrollment?.session?.startsAt?.toISOString() ?? null}
        timezone={enrollment?.session?.timezone ?? null}
        durationHours={enrollment?.course.durationHours ?? 8}
      />
    </SiteShell>
  );
}
