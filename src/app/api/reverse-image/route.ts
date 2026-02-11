import { NextResponse } from "next/server";

function normalizeImageUrl(input: string) {
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

const PROVIDER_IDS = ["google", "bing", "yandex", "tineye"] as const;

type ProviderId = (typeof PROVIDER_IDS)[number];

function parseProviders(raw: string | null): ProviderId[] {
  if (!raw) return PROVIDER_IDS.slice();

  const set = new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const filtered = PROVIDER_IDS.filter((id) => set.has(id));
  return filtered.length ? filtered : PROVIDER_IDS.slice();
}

function safeParam(raw: string | null): "off" | "moderate" | "strict" {
  if (raw === "off" || raw === "moderate" || raw === "strict") return raw;
  return "moderate";
}

function normalizeLocale(raw: string | null, fallback: string) {
  const v = (raw ?? "").trim();
  if (!v) return fallback;
  if (v.length > 12) return fallback;
  return v;
}

function buildLinks(args: {
  imageUrl: string;
  providers: ProviderId[];
  lang: string;
  country: string;
  safe: "off" | "moderate" | "strict";
}) {
  const { imageUrl, providers, lang, country, safe } = args;

  const safeBing = safe === "strict" ? "strict" : safe === "off" ? "off" : "moderate";
  const safeYandex = safe === "strict" ? 2 : safe === "off" ? 0 : 1;

  const map: Record<ProviderId, { provider: string; url: string }> = {
    google: {
      provider: "Google Lens",
      url: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}&hl=${encodeURIComponent(lang)}`,
    },
    bing: {
      provider: "Bing Visual Search",
      url: `https://www.bing.com/images/search?q=imgurl:${encodeURIComponent(
        imageUrl
      )}&view=detailv2&iss=sbi&setlang=${encodeURIComponent(lang)}&cc=${encodeURIComponent(
        country
      )}&adlt=${encodeURIComponent(safeBing)}`,
    },
    yandex: {
      provider: "Yandex Images",
      url: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(
        imageUrl
      )}&lang=${encodeURIComponent(lang)}&safe=${safeYandex}`,
    },
    tineye: {
      provider: "TinEye",
      url: `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`,
    },
  };

  return providers.map((id) => map[id]);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrlParam = searchParams.get("imageUrl") ?? "";
  const imageUrl = normalizeImageUrl(imageUrlParam);
  if (!imageUrl) {
    return NextResponse.json({ message: "Invalid imageUrl" }, { status: 400 });
  }

  const providers = parseProviders(searchParams.get("providers"));
  const lang = normalizeLocale(searchParams.get("lang"), "en");
  const country = normalizeLocale(searchParams.get("country"), "US");
  const safe = safeParam(searchParams.get("safe"));

  const links = buildLinks({
    imageUrl: imageUrl.toString(),
    providers,
    lang,
    country,
    safe,
  });

  return NextResponse.json({ imageUrl: imageUrl.toString(), links });
}