import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validation";
import { unexpected } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { enrollments: true, sessions: true } } },
    });
    return NextResponse.json({ courses });
  } catch (error) {
    return unexpected("admin courses", error);
  }
}

export async function POST(request: Request) {
  try {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = courseSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const existing = await prisma.course.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "That URL slug is already taken." }, { status: 409 });
    }

    const course = await prisma.course.create({ data: parsed.data });
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return unexpected("admin courses", error);
  }
}
