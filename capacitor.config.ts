import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAP_SERVER_URL;

const base: Pick<CapacitorConfig, "appId" | "appName"> = {
  appId: "com.reversethem.search",
  appName: "ReverseThem Search",
};

const config: CapacitorConfig = serverUrl
  ? {
      ...base,
      server: {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
      },
    }
  : {
      ...base,
      // Capacitor expects a prebuilt static web bundle in this folder.
      // NOTE: A pure static export is NOT compatible with Next.js /api route handlers.
      webDir: "out",
    };

export default config;