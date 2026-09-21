import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";
import { makeAccessToken, makeReference } from "@/lib/tokens";
import { getStripe, stripeCurrency, stripeEnabled, toStripeAmount } from "@/lib/stripe";
import { sendBankTransferInstructions, siteUrl } from "@/lib/enrollment";
import { holdExpiry } from "@/lib/payments";

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

  const stripeRequested = input.paymentMethod === "STRIPE";
  const useStripe = stripeRequested && stripeEnabled();
  const method = useStripe ? "STRIPE" : "BANK_TRANSFER";

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
      holdExpiresAt: method === "BANK_TRANSFER" ? holdExpiry() : null,
      paymentMethod: method,
      message: input.message || null,
      accessToken: makeAccessToken(),
    },
  });

  if (method === "BANK_TRANSFER") {
    await sendBankTransferInstructions(enrollment.id);
    return NextResponse.json({
      mode: "transfer",
      reference: enrollment.reference,
      redirect: `/checkout/confirm/${enrollment.accessToken}`,
      fellBack: stripeRequested,
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Card payment is not configured." }, { status: 500 });
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: enrollment.email,
      client_reference_id: enrollment.id,
      metadata: { enrollmentId: enrollment.id, reference: enrollment.reference },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: stripeCurrency(),
            unit_amount: toStripeAmount(amount),
            product_data: {
              name: course.title,
              description:
                input.type === "COMPANY"
                  ? `Private company room — up to ${course.maxAttendees} attendees`
                  : `${attendees} individual seat${attendees > 1 ? "s" : ""}`,
            },
          },
        },
      ],
      success_url: `${await siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${await siteUrl()}/checkout/${course.slug}?cancelled=1`,
    });

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { stripeSessionId: checkout.id },
    });

    return NextResponse.json({ mode: "stripe", url: checkout.url });
  } catch (error) {
    console.error("[checkout] Stripe session failed", error);
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { paymentMethod: "BANK_TRANSFER", holdExpiresAt: holdExpiry() },
    });
    await sendBankTransferInstructions(enrollment.id);
    return NextResponse.json({
      mode: "transfer",
      reference: enrollment.reference,
      redirect: `/checkout/confirm/${enrollment.accessToken}`,
      fellBack: true,
    });
  }
}
