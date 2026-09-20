import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeAccessToken } from "@/lib/tokens";
import { accessEmail, sendMail } from "@/lib/mail";
import { accessUrl, confirmEnrollmentPaid } from "@/lib/enrollment";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const actionSchema = z.object({
  action: z.enum([
    "approve",
    "cancel",
    "refund",
    "revoke",
    "unrevoke",
    "reset_access",
    "resend_link",
    "set_session",
    "note",
  ]),
  sessionId: z.string().optional().nullable(),
  adminNotes: z.string().max(4000).optional(),
  transferReference: z.string().max(200).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown action." }, { status: 422 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: { course: true, session: true },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const { action } = parsed.data;

  switch (action) {
    case "approve": {
      if (parsed.data.transferReference !== undefined) {
        await prisma.enrollment.update({
          where: { id },
          data: { transferReference: parsed.data.transferReference || null },
        });
      }
      const result = await confirmEnrollmentPaid(id);
      return NextResponse.json({ ok: true, result });
    }

    case "cancel":
      await prisma.enrollment.update({ where: { id }, data: { status: "CANCELLED" } });
      break;

    case "refund":
      await prisma.enrollment.update({
        where: { id },
        data: { status: "REFUNDED", accessRevoked: true },
      });
      break;

    case "revoke":
      await prisma.enrollment.update({ where: { id }, data: { accessRevoked: true } });
      break;

    case "unrevoke":
      await prisma.enrollment.update({ where: { id }, data: { accessRevoked: false } });
      break;

    case "reset_access": {
      const token = makeAccessToken();
      await prisma.enrollment.update({
        where: { id },
        data: {
          accessToken: token,
          accessOpenedAt: null,
          accessRevoked: false,
          accessResetCount: { increment: 1 },
        },
      });
      await sendMail({
        to: enrollment.email,
        subject: `A fresh joining link — ${enrollment.course.title}`,
        html: accessEmail({
          name: enrollment.fullName,
          courseTitle: enrollment.course.title,
          reference: enrollment.reference,
          accessUrl: accessUrl(token),
        }),
      });
      return NextResponse.json({ ok: true, accessToken: token });
    }

    case "resend_link":
      await sendMail({
        to: enrollment.email,
        subject: `Your joining link — ${enrollment.course.title}`,
        html: accessEmail({
          name: enrollment.fullName,
          courseTitle: enrollment.course.title,
          reference: enrollment.reference,
          accessUrl: accessUrl(enrollment.accessToken),
        }),
      });
      break;

    case "set_session": {
      const sessionId = parsed.data.sessionId || null;
      if (sessionId) {
        const session = await prisma.courseSession.findFirst({
          where: { id: sessionId, courseId: enrollment.courseId },
        });
        if (!session) {
          return NextResponse.json(
            { error: "That live date belongs to a different workshop." },
            { status: 422 },
          );
        }
      }
      await prisma.enrollment.update({ where: { id }, data: { sessionId } });
      break;
    }

    case "note":
      await prisma.enrollment.update({
        where: { id },
        data: { adminNotes: parsed.data.adminNotes ?? null },
      });
      break;
  }

  return NextResponse.json({ ok: true });
}
