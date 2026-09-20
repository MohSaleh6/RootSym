import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/enrollment";
import { AdminTitle, Empty } from "../ui";
import EnrollmentsTable, { type EnrollmentRow } from "./EnrollmentsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings" };

export default async function AdminEnrollmentsPage() {
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { title: true } },
      session: { select: { startsAt: true, title: true } },
    },
  });

  const base = siteUrl();
  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows: EnrollmentRow[] = enrollments.map((e) => ({
    id: e.id,
    reference: e.reference,
    courseTitle: e.course.title,
    sessionLabel: e.session
      ? `${dateFmt.format(e.session.startsAt)}${e.session.title ? ` — ${e.session.title}` : ""}`
      : null,
    type: e.type,
    fullName: e.fullName,
    email: e.email,
    phone: e.phone,
    organisation: e.organisation,
    jobTitle: e.jobTitle,
    attendees: e.attendees,
    amount: e.amount,
    status: e.status,
    paymentMethod: e.paymentMethod,
    message: e.message,
    adminNotes: e.adminNotes,
    accessToken: e.accessToken,
    accessOpenedAt: e.accessOpenedAt?.toISOString() ?? null,
    accessRevoked: e.accessRevoked,
    accessResetCount: e.accessResetCount,
    createdAt: e.createdAt.toISOString(),
    siteUrl: base,
  }));

  return (
    <div className="space-y-8">
      <AdminTitle
        title="Bookings"
        subtitle="Approve bank transfers, reissue joining links and keep notes on every seat sold."
      />
      {rows.length === 0 ? (
        <Empty>No bookings yet.</Empty>
      ) : (
        <EnrollmentsTable rows={rows} />
      )}
    </div>
  );
}
