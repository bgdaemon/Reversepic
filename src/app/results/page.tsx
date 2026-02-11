import Link from "next/link";
import { ExternalLink, ArrowLeft, ScanSearch } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type LinkItem = { provider: string; url: string };

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
            <div className="text-base font-semibold tracking-tight">Open a provider</div>
            <div className="mt-1 break-all text-xs text-muted-foreground">{imageUrl}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {links.map((l) => (
            <a
              key={l.provider}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-border/60 bg-background/50 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent"
            >
              <span>{l.provider}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
            </a>
          ))}

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
