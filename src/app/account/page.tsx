import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/user-auth";
import AccountView, { type BookingRow } from "./AccountView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your bookings",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await getUserSession();
  if (!session) redirect("/signin?next=%2Faccount");

  const [user, enrollments] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id } }),
    prisma.enrollment.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { title: true, titleAr: true, slug: true } },
        session: { select: { startsAt: true, timezone: true } },
      },
    }),
  ]);

  // The cookie outlived the account — treat it as signed out rather than
  // rendering a page belonging to nobody.
  if (!user) redirect("/signin?next=%2Faccount");

  const rows: BookingRow[] = enrollments.map((e) => ({
    id: e.id,
    reference: e.reference,
    status: e.status,
    amount: e.amount,
    attendees: e.attendees,
    courseTitle: e.course.title,
    courseTitleAr: e.course.titleAr,
    startsAt: e.session?.startsAt.toISOString() ?? null,
    timezone: e.session?.timezone ?? null,
    accessToken: e.accessToken,
    accessOpenedAt: e.accessOpenedAt?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <SiteShell overDark={false}>
      <AccountView
        name={user.name}
        email={user.email}
        phone={user.phone}
        organisation={user.organisation}
        jobTitle={user.jobTitle}
        bookings={rows}
      />
    </SiteShell>
  );
}
