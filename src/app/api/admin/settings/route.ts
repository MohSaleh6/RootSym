import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unexpected } from "@/lib/api";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    let body: Record<string, string>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const entries = Object.entries(body).filter(
      ([key, value]) => typeof key === "string" && typeof value === "string" && key.length < 80,
    );

    await Promise.all(
      entries.map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    return NextResponse.json({ ok: true, saved: entries.length });
  } catch (error) {
    return unexpected("admin settings", error);
  }
}
