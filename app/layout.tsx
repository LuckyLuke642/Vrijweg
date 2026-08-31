import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./live.css";

export const metadata: Metadata = {
  title: "Vrijweg – Toegankelijk op pad",
  description: "Een rustig, meertalig appconcept voor toegankelijkheid onderweg.",
  manifest: "/manifest.webmanifest",
  applicationName: "Vrijweg",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f06f56",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
