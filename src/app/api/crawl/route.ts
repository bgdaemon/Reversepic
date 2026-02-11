import { NextResponse } from "next/server";
import { extractFromHtml } from "@/lib/scrape";

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://${trimmed}`);
    if (!/^https?:$/.test(url.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

function extractEmails(text: string) {
  // Keep it conservative.
  const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  const uniq = Array.from(new Set(matches.map((m) => m.toLowerCase())));
  return uniq.slice(0, 50);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const urlParam = searchParams.get("url") ?? "";
  const url = normalizeUrl(urlParam);
  if (!url) {
    return NextResponse.json({ message: "Invalid url" }, { status: 400 });
  }

  // Basic SSRF guard (same approach as /api/extract)
  const host = url.hostname.toLowerCase();
  const blockedHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
  if (blockedHosts.has(host) || host.endsWith(".local")) {
    return NextResponse.json({ message: "Blocked host" }, { status: 400 });
  }

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  const contentType = resp.headers.get("content-type") || "";
  if (!resp.ok) {
    return NextResponse.json(
      { message: `Fetch failed (${resp.status})`, status: resp.status },
      { status: 502 }
    );
  }
  if (!contentType.includes("text/html")) {
    return NextResponse.json(
      { message: `Unsupported content-type: ${contentType}` },
      { status: 415 }
    );
  }

  const html = await resp.text();
  const extracted = extractFromHtml(html, url.toString());
  const emails = extractEmails(html);

  return NextResponse.json({ ...extracted, emails });
}
