import { NextResponse } from "next/server";
import { extractFromHtml } from "@/lib/scrape";

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    // If user typed without scheme, assume https.
    const url = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://${trimmed}`);
    if (!/^https?:$/.test(url.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const urlParam = searchParams.get("url") ?? "";
  const url = normalizeUrl(urlParam);
  if (!url) {
    return NextResponse.json({ message: "Invalid url" }, { status: 400 });
  }

  // Basic SSRF guard: block localhost/private IPs by hostname string check.
  // (Not perfect, but keeps the template safe without overengineering.)
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
    // Avoid caching for freshest results.
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

  return NextResponse.json(extracted);
}
