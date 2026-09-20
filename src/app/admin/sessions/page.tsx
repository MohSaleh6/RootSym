import { prisma } from "@/lib/prisma";
import { AdminTitle, Empty } from "../ui";
import SessionsManager, { type SessionRow } from "./SessionsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live dates" };

export default async function AdminSessionsPage() {
  const [courses, sessions] = await Promise.all([
    prisma.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, maxAttendees: true },
    }),
    prisma.courseSession.findMany({
      orderBy: { startsAt: "asc" },
      include: {
        course: { select: { title: true } },
        _count: {
          select: { enrollments: { where: { status: { notIn: ["CANCELLED", "REFUNDED"] } } } },
        },
      },
    }),
  ]);

  const rows: SessionRow[] = sessions.map((s) => ({
    id: s.id,
    courseId: s.courseId,
    courseTitle: s.course.title,
    title: s.title,
    startsAt: s.startsAt.toISOString(),
    timezone: s.timezone,
    teamsLink: s.teamsLink,
    seatsTotal: s.seatsTotal,
    booked: s._count.enrollments,
    status: s.status,
    notes: s.notes,
  }));

  return (
    <div className="space-y-8">
      <AdminTitle
        title="Live dates"
        subtitle="Each cohort carries its own Microsoft Teams link. Attendees see it once, through their personal joining page."
      />
      {courses.length === 0 ? (
        <Empty>Create a workshop first, then schedule its live dates here.</Empty>
      ) : (
        <SessionsManager courses={courses} sessions={rows} />
      )}
    </div>
  );
}
