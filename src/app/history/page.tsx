"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Clock, Trash2, Search, ExternalLink } from "lucide-react";

type SearchRecord = {
  id: string;
  kind: "url" | "address" | "image" | "wiki";
  query: string;
  createdAt: string;
  summary?: string;
};

async function loadHistory(): Promise<SearchRecord[]> {
  const res = await fetch("/api/searches", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function HistoryPage() {
  const [items, setItems] = React.useState<SearchRecord[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadHistory();
      setItems(data);
    } catch {
      toast.error("Couldn’t load history");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh().catch(() => null);
  }, [refresh]);

  const filtered = items.filter((it) => {
    const hay = `${it.kind} ${it.query} ${it.summary ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const clearAll = async () => {
    const res = await fetch("/api/searches?all=1", { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn’t clear history");
      return;
    }
    toast.success("History cleared");
    await refresh();
  };

  const deleteOne = async (id: string) => {
    const res = await fetch(`/api/searches?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn’t delete entry");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">History</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Searches saved from your workspace.</p>
        </div>
        <Button
          variant="secondary"
          className="h-10 rounded-2xl"
          onClick={clearAll}
          disabled={items.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      <Card className="rounded-3xl border-border/60 bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter history…"
            className="h-12 rounded-2xl border-border/60 bg-background/60 pl-11 shadow-sm focus-visible:ring-[hsl(var(--brand))]"
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{loading ? "Loading…" : `${filtered.length} item(s)`}</span>
          <Badge className="rounded-2xl bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand-strong))] hover:bg-[hsl(var(--brand-soft))]">
            Local
          </Badge>
        </div>
      </Card>

      <div className="grid gap-3">
        {filtered.map((it) => (
          <Card key={it.id} className="rounded-3xl border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className="rounded-2xl bg-accent text-foreground hover:bg-accent">
                    {it.kind}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(it.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 break-all text-sm font-medium">{it.query}</div>
                {it.summary && <div className="mt-1 text-xs text-muted-foreground">{it.summary}</div>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {it.kind === "image" && (
                  <Button asChild variant="secondary" className="h-9 rounded-2xl">
                    <Link href={`/results?imageUrl=${encodeURIComponent(it.query)}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="h-9 rounded-2xl"
                  onClick={() => deleteOne(it.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="text-xs text-muted-foreground">
              Tip: Save summaries in Settings to remember the filters you used.
            </div>
          </Card>
        ))}

        {!loading && filtered.length === 0 && (
          <Card className="rounded-3xl border-border/60 bg-card p-6 text-center shadow-sm">
            <div className="text-sm font-semibold tracking-tight">No history yet</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Run a reverse image search from the Search tab.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
