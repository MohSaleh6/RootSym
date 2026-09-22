import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";
import { getUserSession } from "@/lib/user-auth";

export const runtime = "nodejs";

/**
 * The account's own details. Email is deliberately not editable here: it is
 * the key every booking and every joining link is addressed to, and changing
 * it would need the same proof of ownership that creating it did.
 */
export async function PATCH(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        organisation: parsed.data.organisation || null,
        jobTitle: parsed.data.jobTitle || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[profile] update failed", error);
    return NextResponse.json({ error: "Could not save your details." }, { status: 503 });
  }
}
