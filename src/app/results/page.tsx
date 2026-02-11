import Link from "next/link";
import { ExternalLink, ArrowLeft, ScanSearch, SquareArrowOutUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type LinkItem = { provider: string; url: string };

function tryGetHostname(raw: string) {
  try {
    return new URL(raw).hostname;
  } catch {
    return raw;
  }
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const imageUrl = typeof params.imageUrl === "string" ? params.imageUrl : "";

  const qs = new URLSearchParams();
  if (typeof params.imageUrl === "string") qs.set("imageUrl", params.imageUrl);
  if (typeof params.providers === "string") qs.set("providers", params.providers);
  if (typeof params.lang === "string") qs.set("lang", params.lang);
  if (typeof params.country === "string") qs.set("country", params.country);
  if (typeof params.safe === "string") qs.set("safe", params.safe);

  const res = await fetch(`/api/reverse-image?${qs.toString()}`, {
    cache: "no-store",
  }).catch(() => null);

  let links: LinkItem[] = [];
  if (res?.ok) {
    const data = (await res.json()) as { links?: LinkItem[] };
    links = data.links ?? [];
  }

  const returnTo = `/results?${qs.toString()}`;
  const canPreview = imageUrl.startsWith("/api/uploads/") || imageUrl.startsWith("http");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Badge className="rounded-2xl bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand-strong))] hover:bg-[hsl(var(--brand-soft))]">
            Results
          </Badge>
        </div>
      </div>

      <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm">
            <ScanSearch className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold tracking-tight">Reverse image results</div>
            <div className="mt-1 break-all text-xs text-muted-foreground">{imageUrl}</div>
          </div>
        </div>

        {canPreview && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-background/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Query"
              className="h-40 w-full object-cover"
            />
          </div>
        )}

        <Separator className="my-4" />

        <div className="grid gap-2">
          {links.map((l) => {
            const host = tryGetHostname(l.url);
            const openInAppHref = `/browser?url=${encodeURIComponent(l.url)}&returnTo=${encodeURIComponent(
              returnTo
            )}`;

            return (
              <div
                key={l.provider}
                className="rounded-3xl border border-border/60 bg-background/50 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold tracking-tight">{l.provider}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{host}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button asChild className="h-11 rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] hover:bg-[hsl(var(--brand-strong))]">
                    <Link href={openInAppHref}>
                      <SquareArrowOutUpRight className="mr-2 h-4 w-4" />
                      Open in app
                    </Link>
                  </Button>

                  <Button asChild variant="secondary" className="h-11 rounded-2xl">
                    <a href={l.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in browser
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}

          {links.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/50 p-4 text-sm text-muted-foreground">
              No providers enabled or the URL was invalid. Go to Settings and enable at least one provider.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}