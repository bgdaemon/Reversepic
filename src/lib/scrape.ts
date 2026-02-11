import { load } from "cheerio";

export type ExtractResult = {
  url: string;
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  links: { href: string; text: string }[];
};

function safeUrlJoin(base: string, href: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

export function extractFromHtml(html: string, pageUrl: string): ExtractResult {
  const $ = load(html);

  const title = $("title").first().text().trim() || null;
  const description =
    $("meta[name='description']").attr("content")?.trim() ||
    $("meta[property='og:description']").attr("content")?.trim() ||
    null;

  const canonicalUrl = $("link[rel='canonical']").attr("href")
    ? safeUrlJoin(pageUrl, $("link[rel='canonical']").attr("href") as string)
    : null;

  const ogImage = $("meta[property='og:image']").attr("content")
    ? safeUrlJoin(pageUrl, $("meta[property='og:image']").attr("content") as string)
    : null;

  const links = $("a[href]")
    .map((_, el) => {
      const href = $(el).attr("href") || "";
      const abs = safeUrlJoin(pageUrl, href);
      if (!abs) return null;
      const text = $(el).text().replace(/\s+/g, " ").trim();
      return { href: abs, text };
    })
    .get()
    .filter((x): x is { href: string; text: string } => Boolean(x));

  return {
    url: pageUrl,
    title,
    description,
    canonicalUrl,
    ogImage,
    links,
  };
}
