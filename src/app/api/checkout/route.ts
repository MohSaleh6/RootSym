import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";
import { makeAccessToken, makeReference } from "@/lib/tokens";
import { sendBankTransferInstructions } from "@/lib/enrollment";
import { cardPaymentsEnabled, holdExpiry } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const course = await prisma.course.findUnique({ where: { slug: input.slug } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "That workshop is not available." }, { status: 404 });
  }

  const attendees =
    input.type === "COMPANY"
      ? Math.min(Math.max(input.attendees, 1), course.maxAttendees)
      : Math.min(Math.max(input.attendees, 1), course.maxAttendees);

  // A company booking buys the whole room; individuals buy seats.
  const amount =
    input.type === "COMPANY" ? course.priceCompany : course.priceIndividual * attendees;

  // Only accept a session that actually belongs to this course and still has room.
  let sessionId: string | null = null;
  if (input.sessionId) {
    const session = await prisma.courseSession.findFirst({
      where: { id: input.sessionId, courseId: course.id },
      include: {
        _count: {
          select: { enrollments: { where: { status: { notIn: ["CANCELLED", "REFUNDED"] } } } },
        },
      },
    });
    if (session && session._count.enrollments < session.seatsTotal) {
      sessionId = session.id;
    }
  }

  // Every booking is a transfer until a gateway that serves Jordan is wired
  // up; the form already offers nothing else, but a client could still ask for
  // a card, so answer honestly that it fell back.
  const cardRequested = input.paymentMethod === "STRIPE" && !cardPaymentsEnabled();

  const enrollment = await prisma.enrollment.create({
    data: {
      reference: makeReference(),
      courseId: course.id,
      sessionId,
      type: input.type,
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      organisation: input.organisation || null,
      jobTitle: input.jobTitle || null,
      attendees,
      amount,
      // A transfer booking holds the seat until the money arrives.
      status: "PENDING",
      holdExpiresAt: holdExpiry(),
      paymentMethod: "BANK_TRANSFER",
      message: input.message || null,
      accessToken: makeAccessToken(),
    },
  });

  await sendBankTransferInstructions(enrollment.id);

  return NextResponse.json({
    mode: "transfer",
    reference: enrollment.reference,
    redirect: `/checkout/confirm/${enrollment.accessToken}`,
    fellBack: cardRequested,
  });
}
