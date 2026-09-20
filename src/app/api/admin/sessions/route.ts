import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = sessionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const startsAt = new Date(parsed.data.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "That date is not valid." }, { status: 422 });
  }

  const session = await prisma.courseSession.create({
    data: {
      courseId: parsed.data.courseId,
      title: parsed.data.title || null,
      startsAt,
      timezone: parsed.data.timezone,
      teamsLink: parsed.data.teamsLink || null,
      seatsTotal: parsed.data.seatsTotal,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
    },
  });

  return NextResponse.json({ session }, { status: 201 });
}
