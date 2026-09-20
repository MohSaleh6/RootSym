import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]);

/**
 * Stores the cover image inline as a data URL on the course record.
 * That keeps the platform free of any extra storage service — set
 * BLOB_READ_WRITE_TOKEN and swap this route for Vercel Blob if the
 * library ever grows beyond a handful of workshops.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, AVIF or SVG image." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That image is larger than 2 MB. Compress it and try again." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = `data:${file.type};base64,${buffer.toString("base64")}`;
  return NextResponse.json({ url, bytes: file.size });
}
