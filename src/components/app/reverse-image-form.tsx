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
import { ArrowRight, ScanSearch, Wand2, ImagePlus, Link2 } from "lucide-react";
import type { ReverseImageSettings } from "@/lib/reverse-image";
import { REVERSE_IMAGE_PROVIDERS } from "@/lib/reverse-image";

const schema = z.object({
  label: z.string().max(60, "Keep it short").optional(),
  imageUrl: z
    .string()
    .optional()
    .refine((v) => !v || v.trim().length === 0 || /^https?:\/\//i.test(v), "Use a full URL like https://…"),
});

type Values = z.infer<typeof schema>;

async function getSettings(): Promise<ReverseImageSettings> {
  const res = await fetch("/api/settings/reverse-image", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

async function saveHistory(args: { query: string; label?: string; summary?: string }) {
  await fetch("/api/searches", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "image", query: args.query, label: args.label, summary: args.summary }),
  }).catch(() => null);
}

async function uploadFile(file: File) {
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Upload failed");
  return data as { id: string; url: string };
}

export function ReverseImageForm() {
  const router = useRouter();
  const [settings, setSettings] = React.useState<ReverseImageSettings | null>(null);
  const [localFile, setLocalFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { imageUrl: "", label: "" },
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
        toast.error("Couldn't load settings");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const runSearch = async (args: { imageUrl: string; label?: string }) => {
    const s = settings ?? (await getSettings());
    const params = new URLSearchParams();
    params.set("imageUrl", args.imageUrl);
    params.set(
      "providers",
      Object.entries(s.providers)
        .filter(([, enabled]) => enabled)
        .map(([id]) => id)
        .join(",")
    );
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
      await saveHistory({ query: args.imageUrl, label: args.label, summary });
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
  };

  const onSubmit = async (values: Values) => {
    try {
      const label = values.label?.trim() || undefined;

      if (localFile) {
        setUploading(true);
        const up = await uploadFile(localFile);
        await runSearch({ imageUrl: up.url, label });
        return;
      }

      const imageUrl = (values.imageUrl ?? "").trim();
      if (!imageUrl) {
        toast.message("Add an image", {
          description: "Paste an image URL or pick a photo from your gallery.",
        });
        return;
      }

      await runSearch({ imageUrl, label });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const previewUrl = React.useMemo(() => {
    if (!localFile) return null;
    return URL.createObjectURL(localFile);
  }, [localFile]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
              Name the image, paste a URL or pick a photo, then jump into provider results.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Name (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'Red sneakers' or 'Profile photo'"
                      className="h-12 rounded-2xl border-border/60 bg-background/60 shadow-sm focus-visible:ring-[hsl(var(--brand))]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <Link2 className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                  Use a URL
                </div>
                <div className="mt-3">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="https://…"
                            className="h-12 rounded-2xl border-border/60 bg-background/60 shadow-sm focus-visible:ring-[hsl(var(--brand))]"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value.trim()) setLocalFile(null);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <ImagePlus className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
                  Pick from gallery
                </div>
                <div className="mt-3 grid gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    className="h-12 rounded-2xl border-border/60 bg-background/60 file:mr-3 file:rounded-xl file:border-0 file:bg-[hsl(var(--brand-soft))] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[hsl(var(--brand-strong))]"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setLocalFile(f);
                      if (f) form.setValue("imageUrl", "");
                    }}
                  />

                  {previewUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Selected" className="h-28 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
                      Choose an image to upload, then Search.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                className="h-12 flex-1 rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm hover:bg-[hsl(var(--brand-strong))]"
                disabled={form.formState.isSubmitting || uploading}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {uploading ? "Uploading…" : "Search"}
                <ArrowRight className="ml-2 h-4 w-4 opacity-80" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-12 rounded-2xl"
                onClick={() => {
                  form.reset({ imageUrl: "", label: "" });
                  setLocalFile(null);
                }}
              >
                Clear
              </Button>
            </div>

            {settings && (
              <div className="rounded-2xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
                Current: {settings.safeSearch} · {settings.language}-{settings.country} ·{" "}
                {Object.values(settings.providers).filter(Boolean).length} providers
              </div>
            )}
          </form>
        </Form>
      </div>
    </Card>
  );
}