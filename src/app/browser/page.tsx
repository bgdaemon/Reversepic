"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldAlert, Globe } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function tryGetHostname(raw: string) {
  try {
    return new URL(raw).hostname;
  } catch {
    return raw;
  }
}

export default function BrowserPage() {
  const sp = useSearchParams();
  const url = sp?.get("url") ?? "";
  const returnTo = sp?.get("returnTo") ?? "/results";

  const hostname = tryGetHostname(url);
  const [loaded, setLoaded] = React.useState(false);
  const [showBlockedHint, setShowBlockedHint] = React.useState(false);

  React.useEffect(() => {
    setLoaded(false);
    setShowBlockedHint(false);
    const t = window.setTimeout(() => setShowBlockedHint(true), 1800);
    return () => window.clearTimeout(t);
  }, [url]);

  if (!url) {
    return (
      <Card className="rounded-3xl border-border/60 bg-card p-6 shadow-sm">
        <div className="text-sm font-semibold tracking-tight">Missing URL</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Go back to Results and open a provider.
        </div>
        <div className="mt-4">
          <Button asChild className="h-11 rounded-2xl">
            <Link href={returnTo}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link href={returnTo}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="secondary" className="h-10 rounded-2xl">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in browser
            </a>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/60 bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 bg-background/60 px-4 py-3">
          <Globe className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">{hostname}</div>
            <div className="truncate text-xs text-muted-foreground">{url}</div>
          </div>
        </div>

        <div className="relative h-[70dvh] bg-background">
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="rounded-3xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                Loading…
              </div>
            </div>
          )}

          {showBlockedHint && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
              <div className="flex items-start gap-2 rounded-3xl border border-border/60 bg-background/80 p-3 text-xs text-muted-foreground backdrop-blur">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-[hsl(var(--brand-strong))]" />
                <div className="min-w-0">
                  Some providers block being embedded inside apps. If you see a blank frame, use "Open in browser".
                </div>
              </div>
            </div>
          )}

          <iframe
            key={url}
            src={url}
            title={hostname}
            className="h-full w-full"
            onLoad={() => setLoaded(true)}
            sandbox="allow-forms allow-popups allow-scripts allow-same-origin"
          />
        </div>
      </Card>
    </div>
  );
}