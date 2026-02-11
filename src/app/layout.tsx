import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AndroidShell } from "@/components/app/android-shell";
import { SettingsProvider } from "@/components/app/settings-store";
import { Toasters } from "@/components/app/toasters";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scout Lens",
  description: "Android-style reverse image research workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SettingsProvider>
            <AndroidShell>{children}</AndroidShell>
            <Toasters />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}