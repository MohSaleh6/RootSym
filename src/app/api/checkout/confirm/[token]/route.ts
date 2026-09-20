import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyTransferSubmitted } from "@/lib/enrollment";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

const schema = z.object({
  transferReference: z.string().trim().min(2).max(200),
  transferNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** The customer reports that they have sent the transfer. */
export async function POST(request: Request, { params }: Params) {
  const { token } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter the reference shown on your transfer receipt." },
      { status: 422 },
    );
  }

  const enrollment = await prisma.enrollment.findUnique({ where: { accessToken: token } });
  if (!enrollment) {
    return NextResponse.json({ error: "We could not find that booking." }, { status: 404 });
  }
  if (enrollment.status === "PAID") {
    return NextResponse.json({ state: "already_paid" });
  }
  if (enrollment.status === "CANCELLED" || enrollment.status === "REFUNDED") {
    return NextResponse.json({ error: "This booking is no longer active." }, { status: 409 });
  }

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: "AWAITING_REVIEW",
      transferReference: parsed.data.transferReference,
      transferNote: parsed.data.transferNote || null,
    },
  });

  await notifyTransferSubmitted(enrollment.id);

  return NextResponse.json({ state: "submitted" });
}
