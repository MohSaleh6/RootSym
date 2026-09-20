import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

/**
 * Consumes a single-use access token and returns the live-session link.
 * The update is conditional, so two concurrent clicks cannot both win.
 */
export async function POST(_request: Request, { params }: Params) {
  const { token } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { accessToken: token },
    include: { course: true, session: true },
  });

  if (!enrollment) {
    return NextResponse.json({ state: "not_found" }, { status: 404 });
  }
  if (enrollment.accessRevoked) {
    return NextResponse.json({ state: "revoked" }, { status: 403 });
  }
  if (enrollment.status !== "PAID") {
    return NextResponse.json({ state: "pending" }, { status: 402 });
  }

  const link = enrollment.session?.teamsLink || enrollment.course.teamsLink || null;

  // No link published yet — do not burn the token.
  if (!link) {
    return NextResponse.json({ state: "tbc" });
  }

  if (enrollment.accessOpenedAt) {
    return NextResponse.json({ state: "used" }, { status: 410 });
  }

  const claimed = await prisma.enrollment.updateMany({
    where: {
      id: enrollment.id,
      accessOpenedAt: null,
      accessRevoked: false,
      status: "PAID",
    },
    data: { accessOpenedAt: new Date() },
  });

  if (claimed.count !== 1) {
    return NextResponse.json({ state: "used" }, { status: 410 });
  }

  return NextResponse.json({ state: "ready", link });
}
