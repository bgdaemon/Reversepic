"use client";

import * as React from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { MapPin, Mail, Globe, ArrowRight, Link2, ScanSearch } from "lucide-react";

const schema = z.object({
  location: z.string().optional(),
  addressOrPlace: z.string().optional(),
  emailOrDomain: z.string().optional(),
  urlToCrawl: z.string().optional(),
});

type Values = z.infer<typeof schema>;

type GeocodeResult = {
  displayName: string;
  lat: number;
  lon: number;
  type?: string;
  importance?: number;
};

type EmailScan = {
  input: string;
  normalized: string;
  possibleProfiles: { label: string; url: string }[];
};

type CrawlResult = {
  url: string;
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  links: { href: string; text: string }[];
  emails: string[];
};

async function saveHistory(args: { kind: "address" | "email" | "crawl"; query: string; summary?: string; label?: string }) {
  await fetch("/api/searches", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args),
  }).catch(() => null);
}

export function ExploreForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { location: "", addressOrPlace: "", emailOrDomain: "", urlToCrawl: "" },
  });

  const [geo, setGeo] = React.useState<GeocodeResult[] | null>(null);
  const [emailScan, setEmailScan] = React.useState<EmailScan | null>(null);
  const [crawl, setCrawl] = React.useState<CrawlResult | null>(null);
  const [loadingGeo, setLoadingGeo] = React.useState(false);
  const [loadingEmail, setLoadingEmail] = React.useState(false);
  const [loadingCrawl, setLoadingCrawl] = React.useState(false);

  const doGeo = async () => {
    const q = (form.getValues("location") ?? "").trim();
    if (!q) return toast.message("Enter a location", { description: "Try a city, address, or landmark." });

    setLoadingGeo(true);
    setGeo(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Geocode failed");
      setGeo(data as GeocodeResult[]);
      await saveHistory({ kind: "address", query: q, summary: "Geocode lookup" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Geocode failed");
    } finally {
      setLoadingGeo(false);
    }
  };

  const doEmail = async () => {
    const input = (form.getValues("emailOrDomain") ?? "").trim();
    if (!input) return toast.message("Enter an email or domain", { description: "Example: name@domain.com or domain.com" });

    setLoadingEmail(true);
    setEmailScan(null);
    try {
      const res = await fetch(`/api/email-scan?q=${encodeURIComponent(input)}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Email scan failed");
      setEmailScan(data as EmailScan);
      await saveHistory({ kind: "email", query: input, summary: "Email/domain scan" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Email scan failed");
    } finally {
      setLoadingEmail(false);
    }
  };

  const doCrawl = async () => {
    const url = (form.getValues("urlToCrawl") ?? "").trim();
    if (!url) return toast.message("Enter a URL", { description: "Example: https://example.com" });

    setLoadingCrawl(true);
    setCrawl(null);
    try {
      const res = await fetch(`/api/crawl?url=${encodeURIComponent(url)}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Crawl failed");
      setCrawl(data as CrawlResult);
      await saveHistory({ kind: "crawl", query: url, summary: "Single-page crawl + email extract" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Crawl failed");
    } finally {
      setLoadingCrawl(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm">
            <ScanSearch className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold tracking-tight">Explore</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Location narrowing, email/domain checks, and a lightweight web crawler.
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
          <div className="text-sm font-semibold tracking-tight">Location / Address</div>
          <Badge className="ml-auto rounded-2xl bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand-strong))] hover:bg-[hsl(var(--brand-soft))]">
            Nominatim
          </Badge>
        </div>
        <Separator className="my-4" />

        <div className="space-y-3">
          <Input
            placeholder="Search city, landmark, or address…"
            className="h-12 rounded-2xl border-border/60 bg-background/60 shadow-sm focus-visible:ring-[hsl(var(--brand))]"
            {...form.register("location")}
          />
          <Button
            type="button"
            onClick={doGeo}
            className="h-12 w-full rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm hover:bg-[hsl(var(--brand-strong))]"
            disabled={loadingGeo}
          >
            {loadingGeo ? "Searching…" : "Search location"}
            <ArrowRight className="ml-2 h-4 w-4 opacity-80" />
          </Button>

          {geo && (
            <div className="grid gap-2">
              {geo.map((r, idx) => (
                <div
                  key={`${r.lat}-${r.lon}-${idx}`}
                  className="rounded-2xl border border-border/60 bg-background/50 p-3"
                >
                  <div className="text-sm font-medium">{r.displayName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {r.lat.toFixed(5)}, {r.lon.toFixed(5)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
          <div className="text-sm font-semibold tracking-tight">Email / Domain</div>
        </div>
        <Separator className="my-4" />

        <div className="space-y-3">
          <Input
            placeholder="name@domain.com or domain.com"
            className="h-12 rounded-2xl border-border/60 bg-background/60 shadow-sm focus-visible:ring-[hsl(var(--brand))]"
            {...form.register("emailOrDomain")}
          />
          <Button
            type="button"
            onClick={doEmail}
            className="h-12 w-full rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm hover:bg-[hsl(var(--brand-strong))]"
            disabled={loadingEmail}
          >
            {loadingEmail ? "Scanning…" : "Scan"}
            <ArrowRight className="ml-2 h-4 w-4 opacity-80" />
          </Button>

          {emailScan && (
            <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
              <div className="text-xs text-muted-foreground">Normalized</div>
              <div className="mt-1 break-all text-sm font-medium">{emailScan.normalized}</div>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground">Quick pivots</div>
              <div className="mt-2 grid gap-2">
                {emailScan.possibleProfiles.map((p) => (
                  <a
                    key={p.url}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-accent"
                  >
                    <span>{p.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
          <div className="text-sm font-semibold tracking-tight">Web crawler (single page)</div>
          <Badge className="ml-auto rounded-2xl bg-accent text-foreground hover:bg-accent">HTML</Badge>
        </div>
        <Separator className="my-4" />

        <div className="space-y-3">
          <Input
            placeholder="https://example.com"
            className="h-12 rounded-2xl border-border/60 bg-background/60 shadow-sm focus-visible:ring-[hsl(var(--brand))]"
            {...form.register("urlToCrawl")}
          />
          <Button
            type="button"
            onClick={doCrawl}
            className="h-12 w-full rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm hover:bg-[hsl(var(--brand-strong))]"
            disabled={loadingCrawl}
          >
            {loadingCrawl ? "Crawling…" : "Crawl"}
            <ArrowRight className="ml-2 h-4 w-4 opacity-80" />
          </Button>

          {crawl && (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-background/50 p-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 text-sm font-semibold tracking-tight">
                  {crawl.title ?? "(No title)"}
                </div>
              </div>
              <div className="break-all text-xs text-muted-foreground">{crawl.url}</div>
              {crawl.description && <div className="text-sm text-muted-foreground">{crawl.description}</div>}

              {crawl.emails.length > 0 && (
                <div>
                  <div className="text-xs font-semibold tracking-tight">Emails found</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {crawl.emails.map((e) => (
                      <Badge key={e} className="rounded-2xl bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand-strong))] hover:bg-[hsl(var(--brand-soft))]">
                        {e}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold tracking-tight">Links</div>
                <div className="mt-2 grid gap-2">
                  {crawl.links.slice(0, 8).map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-accent"
                    >
                      <span className="truncate">{l.text || l.href}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                  {crawl.links.length > 8 && (
                    <div className="text-xs text-muted-foreground">Showing 8 of {crawl.links.length} links.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="rounded-3xl border border-border/60 bg-card p-4 text-sm shadow-sm">
        <div className="font-semibold tracking-tight">Tip</div>
        <div className="mt-1 text-muted-foreground">
          Want deeper crawling (follow links, depth limits, domain allowlist)? Tell me the exact rules you want.
        </div>
      </div>
    </div>
  );
}
