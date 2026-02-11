"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowRight, ScanSearch, Wand2 } from "lucide-react";

import type { ReverseImageSettings } from "@/lib/reverse-image";
import { REVERSE_IMAGE_PROVIDERS } from "@/lib/reverse-image";

const schema = z.object({
  imageUrl: z.string().min(3, "Paste an image URL").url("Enter a valid URL"),
});

type Values = z.infer<typeof schema>;

async function getSettings(): Promise<ReverseImageSettings> {
  const res = await fetch("/api/settings/reverse-image", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

async function saveHistory(kind: "image", query: string, summary?: string) {
  await fetch("/api/searches", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind, query, summary }),
  }).catch(() => null);
}

export function ReverseImageForm() {
  const router = useRouter();
  const [settings, setSettings] = React.useState<ReverseImageSettings | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { imageUrl: "" },
    mode: "onChange",
  });

  React.useEffect(() => {
    let mounted = true;
    getSettings()
      .then((s) => {
        if (!mounted) return;
        setSettings(s);
      })
      .catch(() => {
        toast.error("Couldn’t load settings");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (values: Values) => {
    try {
      const s = settings ?? (await getSettings());
      const params = new URLSearchParams();
      params.set("imageUrl", values.imageUrl);
      params.set("providers", Object.entries(s.providers)
        .filter(([, enabled]) => enabled)
        .map(([id]) => id)
        .join(","));
      params.set("lang", s.language);
      params.set("country", s.country);
      params.set("safe", s.safeSearch);

      const url = `/api/reverse-image?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        toast.error(j?.message ?? "Search failed");
        return;
      }

      const data = (await res.json()) as { imageUrl: string; links: { provider: string; url: string }[] };

      if (s.saveToHistory) {
        const enabledNames = REVERSE_IMAGE_PROVIDERS.filter((p) => s.providers[p.id]).map((p) => p.name);
        const summary = `Providers: ${enabledNames.join(", ")}. Safe: ${s.safeSearch}. ${s.language}-${s.country}`;
        await saveHistory("image", values.imageUrl, summary);
      }

      const first = data.links[0];
      if (!first) {
        toast.message("No links available", { description: "Try enabling more providers in Settings." });
        return;
      }

      if (s.openInNewTab) {
        window.open(first.url, "_blank", "noopener,noreferrer");
      }

      router.push(`/results?${params.toString()}`);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-card p-5 shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(1200px_circle_at_20%_10%,hsl(var(--brand-soft)),transparent_45%),radial-gradient(900px_circle_at_80%_30%,hsl(var(--brand))/18%,transparent_40%)]" />
      <div className="relative">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm">
            <ScanSearch className="h-5 w-5" />

          </div>
          <div className="min-w-0">
            <h1 className="text-pretty text-lg font-semibold tracking-tight">Reverse image search</h1>
            <p className="text-pretty text-sm text-muted-foreground">
              Paste an image URL. We’ll open the best match provider and keep a tidy history.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://…"
                      className="h-12 rounded-2xl border-border/60 bg-background/60 shadow-sm focus-visible:ring-[hsl(var(--brand))]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                className="h-12 flex-1 rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm hover:bg-[hsl(var(--brand-strong))]"
                disabled={!form.formState.isValid || form.formState.isSubmitting}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Search
                <ArrowRight className="ml-2 h-4 w-4 opacity-80" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-12 rounded-2xl"
                onClick={() => {
                  form.reset({ imageUrl: "" });
                }}
              >
                Clear
              </Button>
            </div>

            {settings && (
              <div className="rounded-2xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
                Current: {settings.safeSearch} · {settings.language}-{settings.country} · {Object.values(settings.providers).filter(Boolean).length} providers
              </div>
            )}
          </form>
        </Form>
      </div>
    </Card>
  );
}
