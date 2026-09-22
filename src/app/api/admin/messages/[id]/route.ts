import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unexpected } from "@/lib/api";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    let body: { handled?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    try {
      await prisma.contactMessage.update({
        where: { id },
        data: { handled: Boolean(body.handled) },
      });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }
  } catch (error) {
    return unexpected("admin message", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    try {
      await prisma.contactMessage.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }
  } catch (error) {
    return unexpected("admin message", error);
  }
}
