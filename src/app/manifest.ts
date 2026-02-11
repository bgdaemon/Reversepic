import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scout",
    short_name: "Scout",
    description: "Android-style research workspace for public web lookups.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#4f46e5",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
