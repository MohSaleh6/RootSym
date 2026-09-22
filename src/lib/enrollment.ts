import "server-only";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { formatJod } from "./money";
import { accessEmail, adminAlertEmail, bankTransferEmail, sendMail } from "./mail";
import { HOLD_HOURS, getPaymentDetails, paymentRows } from "./payments";
import { siteConfig, whatsappLink } from "@/content/profile";

/**
 * The origin to build customer-facing links from.
 *
 * Read from the incoming request first, so the joining links and payment
 * pages we email always point at whatever domain the visitor actually used.
 * That means attaching a custom domain needs no rebuild and no config change
 * — links follow the domain on their own. NEXT_PUBLIC_SITE_URL is only the
 * fallback for code paths that run outside a request.
 */
export async function siteUrl(): Promise<string> {
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    if (host) {
      const proto =
        requestHeaders.get("x-forwarded-proto") ??
        (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // Not inside a request — fall back to the configured URL.
  }
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function accessUrl(token: string): Promise<string> {
  return `${await siteUrl()}/access/${token}`;
}

export async function confirmUrl(token: string): Promise<string> {
  return `${await siteUrl()}/checkout/confirm/${token}`;
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

function sessionLine(startsAt: Date | null | undefined, timezone: string | undefined): string | undefined {
  if (!startsAt) return undefined;
  const fmt = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || "Asia/Amman",
  });
  return `Live session: ${fmt.format(startsAt)} (${timezone || "Asia/Amman"}).`;
}

/**
 * Marks an enrollment paid and emails the single-use joining link.
 * Safe to call more than once — the second call is a no-op.
 */
export async function confirmEnrollmentPaid(
  enrollmentId: string,
  patch: { stripePaymentId?: string | null } = {},
): Promise<"confirmed" | "already" | "missing"> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true, session: true },
  });
  if (!enrollment) return "missing";
  if (enrollment.status === "PAID") return "already";

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripePaymentId: patch.stripePaymentId ?? enrollment.stripePaymentId,
    },
  });

  await sendMail({
    to: enrollment.email,
    subject: `Your seat is confirmed — ${enrollment.course.title}`,
    html: accessEmail({
      name: enrollment.fullName,
      courseTitle: enrollment.course.title,
      reference: enrollment.reference,
      accessUrl: await accessUrl(enrollment.accessToken),
      sessionLine: sessionLine(enrollment.session?.startsAt, enrollment.session?.timezone),
    }),
  });

  await notifyAdmin(`Payment received — ${enrollment.reference}`, [
    `Course: ${enrollment.course.title}`,
    `Name: ${enrollment.fullName} <${enrollment.email}>`,
    `Type: ${enrollment.type}`,
    `Attendees: ${enrollment.attendees}`,
    `Amount: ${formatJod(enrollment.amount)}`,
    `Method: ${enrollment.paymentMethod}`,
  ]);

  return "confirmed";
}

export async function sendBankTransferInstructions(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true },
  });
  if (!enrollment) return;

  const details = await getPaymentDetails();
  const rows = paymentRows(details).map((r) => ({ label: r.label, value: r.value }));
  const legacy = await getSetting("bank_transfer_instructions");
  const notes = details.notes || legacy;

  await sendMail({
    to: enrollment.email,
    subject: `Seat held — ${enrollment.course.title} (${enrollment.reference})`,
    html: bankTransferEmail({
      name: enrollment.fullName,
      courseTitle: enrollment.course.title,
      reference: enrollment.reference,
      amount: formatJod(enrollment.amount),
      rows,
      notes,
      confirmUrl: await confirmUrl(enrollment.accessToken),
      holdHours: HOLD_HOURS,
      // Pre-filled so the message that reaches Rand already carries the
      // reference she needs to find the booking.
      whatsappUrl: whatsappLink(
        `Hello Rand, I have paid for my RootSym seat. Booking reference ${enrollment.reference}.`,
      ),
      whatsappNumber: siteConfig.phone,
    }),
  });

  await notifyAdmin(`New booking — ${enrollment.reference}`, [
    `Course: ${enrollment.course.title}`,
    `Name: ${enrollment.fullName} <${enrollment.email}>`,
    enrollment.phone ? `Phone: ${enrollment.phone}` : "",
    enrollment.organisation ? `Organisation: ${enrollment.organisation}` : "",
    `Type: ${enrollment.type}`,
    `Attendees: ${enrollment.attendees}`,
    `Amount: ${formatJod(enrollment.amount)}`,
    `Seat held until: ${enrollment.holdExpiresAt?.toISOString() ?? "—"}`,
    "",
    "They have been asked to pay and then message you on WhatsApp.",
    `Confirm the seat from the admin panel: ${await siteUrl()}/admin/enrollments`,
  ].filter(Boolean));
}

/** The customer has told us the money is on its way. */
export async function notifyTransferSubmitted(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true },
  });
  if (!enrollment) return;

  await notifyAdmin(`Transfer reported — ${enrollment.reference}`, [
    `Course: ${enrollment.course.title}`,
    `Name: ${enrollment.fullName} <${enrollment.email}>`,
    `Amount: ${formatJod(enrollment.amount)}`,
    `Their reference: ${enrollment.transferReference || "—"}`,
    enrollment.transferNote ? `Note: ${enrollment.transferNote}` : "",
    "Check the account, then approve it on the Bookings page.",
  ].filter(Boolean));
}

/** Returns whether the notification actually left the building. */
export async function notifyAdmin(title: string, lines: string[]): Promise<boolean> {
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (!to) return false;
  return sendMail({ to, subject: `[RootSym] ${title}`, html: adminAlertEmail({ title, lines }) });
}
