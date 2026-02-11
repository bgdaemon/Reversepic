import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { DEFAULT_REVERSE_IMAGE_SETTINGS, REVERSE_IMAGE_PROVIDERS } from "@/lib/reverse-image";
import type { ReverseImageSettings } from "@/lib/reverse-image";

function sanitizeSettings(input: unknown): ReverseImageSettings {
  const base = DEFAULT_REVERSE_IMAGE_SETTINGS;
  if (!input || typeof input !== "object") return base;
  const obj = input as Partial<ReverseImageSettings>;

  const providers: ReverseImageSettings["providers"] = { ...base.providers };
  for (const p of REVERSE_IMAGE_PROVIDERS) {
    const v = (obj.providers as any)?.[p.id];
    if (typeof v === "boolean") providers[p.id] = v;
  }

  const safe = obj.safeSearch;
  const safeSearch: ReverseImageSettings["safeSearch"] =
    safe === "off" || safe === "moderate" || safe === "strict" ? safe : base.safeSearch;

  return {
    providers,
    openInNewTab: typeof obj.openInNewTab === "boolean" ? obj.openInNewTab : base.openInNewTab,
    saveToHistory: typeof obj.saveToHistory === "boolean" ? obj.saveToHistory : base.saveToHistory,
    language: typeof obj.language === "string" && obj.language.trim() ? obj.language.trim() : base.language,
    country: typeof obj.country === "string" && obj.country.trim() ? obj.country.trim() : base.country,
    safeSearch,
  };
}

export async function GET() {
  const db = await getDb();
  const settings = (db.data?.settings?.reverseImage ?? DEFAULT_REVERSE_IMAGE_SETTINGS) as unknown;
  return NextResponse.json(sanitizeSettings(settings));
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const next = sanitizeSettings(body);

  const db = await getDb();
  db.data!.settings = db.data!.settings ?? {};
  db.data!.settings.reverseImage = next;
  await db.write();

  return NextResponse.json(next);
}
