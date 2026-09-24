import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatJod } from "@/lib/money";
import { AdminTitle, Card, Stat, Badge, Empty } from "./ui";
import { formatAdminDateTime } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [courses, published, paid, awaiting, revenue, messages, recent, upcoming] =
    await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.enrollment.count({ where: { status: "PAID" } }),
      prisma.enrollment.count({ where: { status: "AWAITING_REVIEW" } }),
      prisma.enrollment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
      prisma.contactMessage.count({ where: { handled: false } }),
      prisma.enrollment.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { course: { select: { title: true } } },
      }),
      prisma.courseSession.findMany({
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 4,
        include: {
          course: { select: { title: true } },
          _count: {
            select: { enrollments: { where: { status: { notIn: ["CANCELLED", "REFUNDED"] } } } },
          },
        },
      }),
    ]);


  return (
    <div className="space-y-8">
      <AdminTitle
        title="Dashboard"
        subtitle="Everything happening across RootSym right now."
        action={
          <Link href="/admin/courses/new" className="btn-gold !py-2.5 !text-[0.82rem]">
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            New workshop
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue (paid)" value={formatJod(revenue._sum.amount ?? 0)} tone="gold" />
        <Stat label="Confirmed bookings" value={paid} tone="green" />
        <Stat
          label="Awaiting approval"
          value={awaiting}
          tone={awaiting > 0 ? "ember" : "default"}
          hint={awaiting > 0 ? "Bank transfers to review" : "Nothing waiting"}
        />
        <Stat label="Unread messages" value={messages} tone={messages > 0 ? "ember" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card padded={false}>
          <div className="flex items-center justify-between border-b border-dune px-6 py-4">
            <h2 className="font-display text-lg font-semibold text-abyss">Latest bookings</h2>
            <Link
              href="/admin/enrollments"
              className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-teal transition-colors hover:text-gold"
            >
              All bookings
              <ArrowUpRight className="h-3.5 w-3.5 flip-x" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-6">
              <Empty>No bookings yet. They will appear here the moment someone reserves a seat.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-dune/70">
              {recent.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9rem] font-semibold text-abyss">
                      {e.fullName}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.78rem] text-slate-ink">
                      {e.course.title}
                    </span>
                  </span>
                  <span className="font-mono text-[0.76rem] text-slate-ink/70" dir="ltr">
                    {e.reference}
                  </span>
                  <span className="text-[0.84rem] font-semibold tabular-nums text-abyss">
                    {formatJod(e.amount)}
                  </span>
                  <Badge value={e.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card padded={false}>
            <div className="flex items-center justify-between border-b border-dune px-6 py-4">
              <h2 className="font-display text-lg font-semibold text-abyss">Next live dates</h2>
              <Link
                href="/admin/sessions"
                className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-teal transition-colors hover:text-gold"
              >
                Manage
                <ArrowUpRight className="h-3.5 w-3.5 flip-x" />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="p-6">
                <Empty>No live dates scheduled.</Empty>
              </div>
            ) : (
              <ul className="divide-y divide-dune/70">
                {upcoming.map((s) => (
                  <li key={s.id} className="px-6 py-4">
                    <p className="text-[0.86rem] font-semibold text-abyss">
                      {formatAdminDateTime(s.startsAt, s.timezone)}
                    </p>
                    <p className="mt-0.5 truncate text-[0.78rem] text-slate-ink">{s.course.title}</p>
                    <p className="mt-1.5 flex items-center gap-2 text-[0.72rem] text-slate-ink/70">
                      <span className="tabular-nums">
                        {s._count.enrollments}/{s.seatsTotal} seats
                      </span>
                      {!s.teamsLink && (
                        <span className="rounded-full border border-ember/45 bg-ember/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ember">
                          no Teams link
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-abyss">Library</h2>
            <p className="mt-2 text-[0.86rem] text-slate-ink">
              {published} of {courses} workshops are live on the site.
            </p>
            <Link href="/admin/courses" className="btn-outline mt-4 !py-2.5 !text-[0.82rem]">
              Manage workshops
              <ArrowUpRight className="h-3.5 w-3.5 flip-x" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
