import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.reversethem.search",
  appName: "ReverseThem Search",

  // If you set CAP_SERVER_URL to a hosted deployment (recommended for this Next.js app
  // because it uses server routes under /api), the Android app will load that URL.
  // Example: https://your-domain.com
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
        },
      }
    : {
        // Otherwise Capacitor expects a prebuilt static web bundle in this folder.
        // NOTE: A pure static export is NOT compatible with Next.js /api route handlers.
        webDir: "out",
      }),

  bundledWebRuntime: false,
};

export default config;