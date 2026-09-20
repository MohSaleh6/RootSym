import "server-only";
import { prisma } from "./prisma";
import { formatJod } from "./money";
import { accessEmail, adminAlertEmail, bankTransferEmail, sendMail } from "./mail";
import { HOLD_HOURS, getPaymentDetails, paymentRows } from "./payments";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function accessUrl(token: string): string {
  return `${siteUrl()}/access/${token}`;
}

export function confirmUrl(token: string): string {
  return `${siteUrl()}/checkout/confirm/${token}`;
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
      accessUrl: accessUrl(enrollment.accessToken),
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
      confirmUrl: confirmUrl(enrollment.accessToken),
      holdHours: HOLD_HOURS,
    }),
  });

  await notifyAdmin(`Seat held, awaiting transfer — ${enrollment.reference}`, [
    `Course: ${enrollment.course.title}`,
    `Name: ${enrollment.fullName} <${enrollment.email}>`,
    `Amount: ${formatJod(enrollment.amount)}`,
    `Held until: ${enrollment.holdExpiresAt?.toISOString() ?? "—"}`,
  ]);
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

export async function notifyAdmin(title: string, lines: string[]): Promise<void> {
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (!to) return;
  await sendMail({ to, subject: `[RootSym] ${title}`, html: adminAlertEmail({ title, lines }) });
}
