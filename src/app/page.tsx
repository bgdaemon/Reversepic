import { ReverseImageForm } from "@/components/app/reverse-image-form";

export default function Home() {
  return (
    <div className="space-y-4">
      <ReverseImageForm />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-4 text-sm shadow-sm">
          <div className="font-semibold tracking-tight">Layer 1: Search</div>
          <div className="mt-1 text-muted-foreground">
            Paste an image URL and jump into provider results.
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-4 text-sm shadow-sm">
          <div className="font-semibold tracking-tight">Layer 2: Tune</div>
          <div className="mt-1 text-muted-foreground">
            Use Settings to narrow providers, locale, and safe-search behavior.
          </div>
        </div>
      </div>
    </div>
  );
}