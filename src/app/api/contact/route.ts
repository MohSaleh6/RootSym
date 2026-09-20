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

  await notifyAdmin(`New message — ${input.subject}`, [
    `From: ${input.name} <${input.email}>`,
    input.organisation ? `Organisation: ${input.organisation}` : "",
    input.phone ? `Phone: ${input.phone}` : "",
    "",
    input.message,
  ].filter(Boolean));

  return NextResponse.json({ ok: true, id: row.id });
}
