import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ExternalLink, Users, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatJod } from "@/lib/money";
import { AdminTitle, Empty } from "../ui";
import DeleteCourseButton from "./DeleteCourseButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Workshops" };

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { enrollments: true, sessions: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminTitle
        title="Workshops"
        subtitle="Add, edit, publish and price everything the site sells."
        action={
          <Link href="/admin/courses/new" className="btn-gold !py-2.5 !text-[0.82rem]">
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            New workshop
          </Link>
        }
      />

      {courses.length === 0 ? (
        <Empty>No workshops yet. Create your first one to put it on the site.</Empty>
      ) : (
        <ul className="grid gap-4">
          {courses.map((c) => (
            <li
              key={c.id}
              className="group flex flex-col gap-5 rounded-2xl border border-dune bg-parchment p-5 transition-all duration-400 hover:border-gold/45 hover:shadow-lux sm:flex-row"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-abyss sm:w-44">
                {c.imageUrl ? (
                  <Image src={c.imageUrl} alt="" fill unoptimized className="object-cover" />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(120% 120% at 20% 10%, ${c.accentColor}66 0%, #0b2a36 62%)`,
                    }}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-abyss">{c.title}</h2>
                  {c.featured && (
                    <span className="rounded-full border border-gold/50 bg-gold/12 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-gold">
                      featured
                    </span>
                  )}
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${
                      c.published
                        ? "border-leaf/50 bg-leaf/12 text-moss"
                        : "border-slate-ink/30 bg-slate-ink/10 text-slate-ink"
                    }`}
                  >
                    {c.published ? "published" : "draft"}
                  </span>
                </div>

                <p className="mt-1 text-[0.84rem] text-teal">{c.tagline}</p>
                <p className="mt-2 line-clamp-2 text-[0.84rem] leading-relaxed text-slate-ink">
                  {c.summary}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.76rem] text-slate-ink/80">
                  <span className="tabular-nums">
                    {formatJod(c.priceIndividual)} · {formatJod(c.priceCompany)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-teal" strokeWidth={1.8} />
                    {c._count.enrollments} bookings
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-teal" strokeWidth={1.8} />
                    {c._count.sessions} dates
                  </span>
                  <span className="font-mono text-[0.72rem] text-slate-ink/60" dir="ltr">
                    /{c.slug}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                <Link
                  href={`/admin/courses/${c.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-teal transition-colors hover:border-gold hover:bg-gold/10 hover:text-abyss"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                  Edit
                </Link>
                <Link
                  href={`/courses/${c.slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-dune px-3.5 py-2 text-[0.76rem] font-semibold text-slate-ink transition-colors hover:border-teal hover:text-teal"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.9} />
                  View
                </Link>
                <DeleteCourseButton id={c.id} title={c.title} disabled={c._count.enrollments > 0} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
