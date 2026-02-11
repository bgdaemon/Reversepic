import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";

export type SearchRecord = {
  id: string;
  kind: "url" | "address" | "image" | "wiki";
  query: string;
  createdAt: string;
  summary?: string;
};

export async function GET() {
  const db = await getDb();
  const searches = db.data?.searches ?? [];
  const sorted = [...searches].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json(sorted);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<SearchRecord> | null;
  if (!body?.kind || !body?.query) {
    return NextResponse.json({ message: "Missing kind/query" }, { status: 400 });
  }

  const record: SearchRecord = {
    id: body.id || crypto.randomUUID(),
    kind: body.kind,
    query: String(body.query),
    createdAt: body.createdAt || new Date().toISOString(),
    summary: body.summary ? String(body.summary) : undefined,
  };

  const db = await getDb();
  db.data!.searches.push(record);
  await db.write();

  return NextResponse.json(record, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = searchParams.get("all");

  const db = await getDb();
  if (all === "1") {
    db.data!.searches = [];
    await db.write();
    return NextResponse.json({ ok: true });
  }

  if (!id) return NextResponse.json({ message: "Missing id or all=1" }, { status: 400 });

  db.data!.searches = (db.data!.searches ?? []).filter((s) => s.id !== id);
  await db.write();
  return NextResponse.json({ ok: true });
}
