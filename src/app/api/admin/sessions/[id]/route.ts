import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionSchema } from "@/lib/validation";

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

  const parsed = sessionSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields." }, { status: 422 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title || null;
  if (parsed.data.timezone !== undefined) data.timezone = parsed.data.timezone;
  if (parsed.data.teamsLink !== undefined) data.teamsLink = parsed.data.teamsLink || null;
  if (parsed.data.seatsTotal !== undefined) data.seatsTotal = parsed.data.seatsTotal;
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes || null;
  if (parsed.data.startsAt !== undefined) {
    const startsAt = new Date(parsed.data.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "That date is not valid." }, { status: 422 });
    }
    data.startsAt = startsAt;
  }

  try {
    const session = await prisma.courseSession.update({ where: { id }, data });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Live date not found." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const booked = await prisma.enrollment.count({ where: { sessionId: id } });
  if (booked > 0) {
    return NextResponse.json(
      { error: `${booked} booking(s) point at this date. Cancel it instead of deleting it.` },
      { status: 409 },
    );
  }
  try {
    await prisma.courseSession.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Live date not found." }, { status: 404 });
  }
}
