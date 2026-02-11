import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReverseThem Search",
    short_name: "ReverseThem",
    description: "Android-style reverse image research workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F5FF",
    theme_color: "#6D28D9",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}