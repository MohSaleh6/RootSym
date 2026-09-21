import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";
import { notifyAdmin } from "@/lib/enrollment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const lines = [
    `From: ${input.name} <${input.email}>`,
    input.organisation ? `Organisation: ${input.organisation}` : "",
    input.phone ? `Phone: ${input.phone}` : "",
    "",
    input.message,
  ].filter(Boolean);

  // Saving and notifying are deliberately independent. Somebody took the
  // trouble to write this; losing it because one of the two is misconfigured
  // would be the worst possible outcome, so either one succeeding counts.
  let id: string | null = null;
  try {
    const row = await prisma.contactMessage.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        organisation: input.organisation || null,
        subject: input.subject,
        message: input.message,
      },
    });
    id = row.id;
  } catch (error) {
    console.error("[contact] could not store the message — see /admin/health", error);
  }

  const notified = await notifyAdmin(`New message — ${input.subject}`, lines);

  if (!id && !notified) {
    // Nothing kept it and nothing carried it. Say so rather than thanking
    // them for a message that no longer exists anywhere.
    console.error("[contact] message lost: the database rejected it and no email was sent");
    return NextResponse.json(
      { error: "We could not deliver your message. Please email us directly." },
      { status: 503 },
    );
  }

  if (!id) {
    console.warn("[contact] message emailed but not stored — it will not appear in the admin panel");
  }

  return NextResponse.json({ ok: true, id });
}
