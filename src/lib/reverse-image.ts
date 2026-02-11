export type ReverseImageProviderId = "google" | "bing" | "yandex" | "tineye";

export type ReverseImageProvider = {
  id: ReverseImageProviderId;
  name: string;
  description: string;
};

export type ReverseImageSettings = {
  providers: Record<ReverseImageProviderId, boolean>;
  // General
  openInNewTab: boolean;
  saveToHistory: boolean;

  // Filters
  language: string; // BCP-47-ish: "en", "en-US", ...
  country: string; // ISO-ish: "US", "GB", "DE", ...
  safeSearch: "off" | "moderate" | "strict";
};

export const REVERSE_IMAGE_PROVIDERS: ReverseImageProvider[] = [
  {
    id: "google",
    name: "Google Lens",
    description: "Broadest results; great for products and landmarks.",
  },
  {
    id: "bing",
    name: "Bing Visual Search",
    description: "Strong for shopping matches and visually similar images.",
  },
  {
    id: "yandex",
    name: "Yandex Images",
    description: "Often finds alternate sources and reposts.",
  },
  {
    id: "tineye",
    name: "TinEye",
    description: "Best for tracking where an image appeared over time.",
  },
];

export const DEFAULT_REVERSE_IMAGE_SETTINGS: ReverseImageSettings = {
  providers: {
    google: true,
    bing: true,
    yandex: true,
    tineye: true,
  },
  // Default to staying inside the app (Results screen) instead of popping external tabs.
  openInNewTab: false,
  saveToHistory: true,
  language: "en",
  country: "US",
  safeSearch: "moderate",
};