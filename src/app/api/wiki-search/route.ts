import { NextResponse } from "next/server";

export type WikiSearchItem = {
  title: string;
  description: string;
  url: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ message: "Missing q" }, { status: 400 });

  const base = process.env.WIKIPEDIA_API_URL || "https://en.wikipedia.org";
  const url = new URL("/w/rest.php/v1/search/title", base);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "12");

  const resp = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      "user-agent": "DyadSearchApp/1.0 (demo; contact: local)",
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    return NextResponse.json({ message: `Wiki search failed (${resp.status})` }, { status: 502 });
  }

  const data = (await resp.json()) as any;
  const pages = Array.isArray(data?.pages) ? data.pages : [];

  const mapped: WikiSearchItem[] = pages.map((p: any) => {
    const title = String(p?.title ?? "");
    const description = String(p?.excerpt ?? "").replace(/<[^>]*>/g, "");
    const pageUrl = title ? `${base}/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}` : base;
    return { title, description, url: pageUrl };
  });

  return NextResponse.json({ query: q, results: mapped });
}
