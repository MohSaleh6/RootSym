import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validation";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = courseSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  if (parsed.data.slug) {
    const clash = await prisma.course.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (clash) {
      return NextResponse.json({ error: "That URL slug is already taken." }, { status: 409 });
    }
  }

  try {
    const course = await prisma.course.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ course });
  } catch {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const bookings = await prisma.enrollment.count({ where: { courseId: id } });
  if (bookings > 0) {
    return NextResponse.json(
      {
        error: `This workshop has ${bookings} booking(s) and cannot be deleted. Unpublish it instead.`,
      },
      { status: 409 },
    );
  }

  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }
}
