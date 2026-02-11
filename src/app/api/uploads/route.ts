import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = process.env.UPLOADS_DIR || process.env.DATABASE_DIR || "./data";

function safeExt(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return null;
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ message: "Expected multipart/form-data" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Missing file" }, { status: 400 });
  }

  const ext = safeExt(file.type);
  if (!ext) {
    return NextResponse.json(
      { message: "Unsupported file type. Use JPG, PNG, or WEBP." },
      { status: 415 }
    );
  }

  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json({ message: "File too large (max 6MB)." }, { status: 413 });
  }

  const id = crypto.randomUUID();
  const filename = `${id}.${ext}`;

  const dir = path.resolve(process.cwd(), UPLOADS_DIR, "uploads");
  await fs.mkdir(dir, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buf);

  const db = await getDb();
  db.data!.uploads.push({
    id,
    filename,
    contentType: file.type,
    createdAt: new Date().toISOString(),
  });
  await db.write();

  return NextResponse.json({
    id,
    url: `/api/uploads/${encodeURIComponent(id)}`,
    filename,
    contentType: file.type,
  });
}
