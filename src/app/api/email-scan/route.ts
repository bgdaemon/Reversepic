import { NextResponse } from "next/server";

function normalize(input: string) {
  const q = input.trim();
  if (!q) return null;
  // If it's an email, keep it; otherwise treat as domain.
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q);
  if (isEmail) return q.toLowerCase();

  // Domain normalization: strip scheme/path
  try {
    const url = q.includes("://") ? new URL(q) : new URL(`https://${q}`);
    return url.hostname.toLowerCase();
  } catch {
    // fallback to raw
    return q.toLowerCase();
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const normalized = normalize(q);
  if (!normalized) return NextResponse.json({ message: "Missing q" }, { status: 400 });

  const isEmail = normalized.includes("@");
  const domain = isEmail ? normalized.split("@")[1] : normalized;

  const possibleProfiles = [
    {
      label: "Google (exact match)",
      url: `https://www.google.com/search?q=${encodeURIComponent(
        isEmail ? `\"${normalized}\"` : `site:${domain} contact email`
      )}`,
    },
    {
      label: "HaveIBeenPwned (manual check)",
      url: "https://haveibeenpwned.com/",
    },
    {
      label: "Hunter.io (manual)",
      url: `https://hunter.io/search/${encodeURIComponent(domain)}`,
    },
    {
      label: "GitHub search",
      url: `https://github.com/search?q=${encodeURIComponent(isEmail ? normalized : domain)}&type=code`,
    },
    {
      label: "LinkedIn (query)",
      url: `https://www.google.com/search?q=${encodeURIComponent(
        isEmail ? `${normalized} site:linkedin.com` : `${domain} site:linkedin.com`
      )}`,
    },
  ];

  return NextResponse.json({ input: q, normalized, possibleProfiles });
}
