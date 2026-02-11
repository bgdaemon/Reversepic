import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = process.env.UPLOADS_DIR || process.env.DATABASE_DIR || "./data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const meta = (db.data?.uploads ?? []).find((u) => u.id === id);
  if (!meta) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const filePath = path.resolve(process.cwd(), UPLOADS_DIR, "uploads", meta.filename);
  let buf: Buffer;
  try {
    buf = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ message: "Missing file" }, { status: 404 });
  }

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "content-type": meta.contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
