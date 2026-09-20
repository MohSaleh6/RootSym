import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { confirmEnrollmentPaid } from "@/lib/enrollment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret);
  } catch (error) {
    console.error("[stripe] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        const enrollmentId =
          (session.metadata?.enrollmentId as string | undefined) ||
          session.client_reference_id ||
          (await prisma.enrollment.findUnique({ where: { stripeSessionId: session.id } }))?.id;

        if (enrollmentId) {
          await confirmEnrollmentPaid(enrollmentId, {
            stripePaymentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
          });
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.enrollment.updateMany({
        where: { stripeSessionId: session.id, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
    }
  } catch (error) {
    console.error("[stripe] handler failed", error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
