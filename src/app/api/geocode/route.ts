import { NextResponse } from "next/server";

export type GeocodeResult = {
  query: string;
  displayName: string;
  lat: number;
  lon: number;
  type?: string;
  importance?: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ message: "Missing q" }, { status: 400 });

  // OpenStreetMap Nominatim: free, but must provide a descriptive User-Agent.
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "10");

  const resp = await fetch(url.toString(), {
    headers: {
      "user-agent": "DyadSearchApp/1.0 (demo; contact: local) ",
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    return NextResponse.json({ message: `Geocode failed (${resp.status})` }, { status: 502 });
  }

  const data = (await resp.json()) as Array<any>;
  const mapped: GeocodeResult[] = data.map((r) => ({
    query: q,
    displayName: String(r.display_name ?? ""),
    lat: Number(r.lat),
    lon: Number(r.lon),
    type: r.type ? String(r.type) : undefined,
    importance: r.importance != null ? Number(r.importance) : undefined,
  }));

  return NextResponse.json(mapped);
}
