"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ScanSearch,
  Settings,
  Clock,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Search", icon: ScanSearch },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AndroidShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[hsl(var(--background))]">
      {/* Top app bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-screen-sm items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-tight">
              Scout Lens
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              <span className="truncate">Reverse image workspace</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/settings"
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition",
                "hover:bg-accent",
                pathname === "/settings" && "border-[hsl(var(--brand))]/40"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Tune
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-screen-sm px-4 pb-24 pt-5">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto grid w-full max-w-screen-sm grid-cols-3 gap-1 px-3 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition",
                  active
                    ? "bg-[hsl(var(--brand-soft))] text-[hsl(var(--brand-strong))]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={cn(
                    "flex h-9 w-14 items-center justify-center rounded-2xl transition",
                    active
                      ? "bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] shadow-sm"
                      : "bg-card text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}