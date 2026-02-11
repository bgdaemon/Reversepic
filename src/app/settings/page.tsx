"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/components/app/settings-store";
import { REVERSE_IMAGE_PROVIDERS } from "@/lib/reverse-image";
import type { ReverseImageProviderId } from "@/lib/reverse-image";
import { Settings2, ShieldCheck, Globe2, SlidersHorizontal, History } from "lucide-react";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
];

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "BR", label: "Brazil" },
  { value: "JP", label: "Japan" },
];

export default function SettingsPage() {
  const { reverseImage, setReverseImage } = useSettings();
  const [saving, setSaving] = React.useState(false);

  const update = async (patch: Partial<typeof reverseImage>) => {
    setSaving(true);
    try {
      await setReverseImage({ ...reverseImage, ...patch });
      toast.success("Settings saved");
    } catch {
      toast.error("Couldn’t save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateProvider = async (id: ReverseImageProviderId, enabled: boolean) => {
    const next = {
      ...reverseImage,
      providers: { ...reverseImage.providers, [id]: enabled },
    };
    setSaving(true);
    try {
      await setReverseImage(next);
      toast.success("Provider updated");
    } catch {
      toast.error("Couldn’t save provider");
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = Object.values(reverseImage.providers).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm">
              <Settings2 className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Tune providers and filters to narrow your results.
          </p>
        </div>
        <Badge className="rounded-2xl bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand-strong))] hover:bg-[hsl(var(--brand-soft))]">
          {enabledCount} enabled
        </Badge>
      </div>

      <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
          <div className="text-sm font-semibold tracking-tight">General</div>
        </div>
        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium">Open first provider automatically</div>
              <div className="text-xs text-muted-foreground">
                After you search, open the top provider in a new tab.
              </div>
            </div>
            <Switch
              checked={reverseImage.openInNewTab}
              onCheckedChange={(v) => update({ openInNewTab: v })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4 text-muted-foreground" />
                Save to history
              </div>
              <div className="text-xs text-muted-foreground">Keeps a searchable log inside the app.</div>
            </div>
            <Switch
              checked={reverseImage.saveToHistory}
              onCheckedChange={(v) => update({ saveToHistory: v })}
              disabled={saving}
            />
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
          <div className="text-sm font-semibold tracking-tight">Providers</div>
        </div>
        <Separator className="my-4" />

        <div className="space-y-2">
          {REVERSE_IMAGE_PROVIDERS.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/50 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div>
              </div>
              <Switch
                checked={reverseImage.providers[p.id]}
                onCheckedChange={(v) => updateProvider(p.id, v)}
                disabled={saving}
              />
            </div>
          ))}

          {enabledCount === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/50 p-4 text-sm">
              <span className="font-medium">No providers enabled.</span>{" "}
              <span className="text-muted-foreground">Enable at least one to generate results.</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="rounded-3xl border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-[hsl(var(--brand-strong))]" />
          <div className="text-sm font-semibold tracking-tight">Filters</div>
        </div>
        <Separator className="my-4" />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Language</Label>
            <Select value={reverseImage.language} onValueChange={(v) => update({ language: v })}>
              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Country</Label>
            <Select value={reverseImage.country} onValueChange={(v) => update({ country: v })}>
              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Safe search</Label>
            <Select
              value={reverseImage.safeSearch}
              onValueChange={(v) => update({ safeSearch: v as any })}
            >
              <SelectTrigger className="h-12 rounded-2xl border-border/60 bg-background/50">
                <SelectValue placeholder="Safe search" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-1">
            <Button
              type="button"
              className="h-12 w-full rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm hover:bg-[hsl(var(--brand-strong))]"
              disabled={saving}
              onClick={() => toast.message("Tip", { description: "More filters can be added (filetype, site:, time range) if you tell me what you need." })}
            >
              Save tips
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
