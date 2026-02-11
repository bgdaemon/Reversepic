"use client";

import * as React from "react";
import type { ReverseImageSettings } from "@/lib/reverse-image";
import { DEFAULT_REVERSE_IMAGE_SETTINGS } from "@/lib/reverse-image";

export type SettingsContextValue = {
  reverseImage: ReverseImageSettings;
  setReverseImage: (next: ReverseImageSettings) => Promise<void>;
  refresh: () => Promise<void>;
};

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

async function fetchSettings(): Promise<ReverseImageSettings> {
  const res = await fetch("/api/settings/reverse-image", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [reverseImage, setReverseImageState] = React.useState<ReverseImageSettings>(
    DEFAULT_REVERSE_IMAGE_SETTINGS
  );

  const refresh = React.useCallback(async () => {
    const s = await fetchSettings();
    setReverseImageState(s);
  }, []);

  React.useEffect(() => {
    refresh().catch(() => null);
  }, [refresh]);

  const setReverseImage = React.useCallback(async (next: ReverseImageSettings) => {
    setReverseImageState(next);
    const res = await fetch("/api/settings/reverse-image", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      // revert by reloading; keep it simple
      await refresh().catch(() => null);
      throw new Error("Failed to save settings");
    }
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ reverseImage, setReverseImage, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
