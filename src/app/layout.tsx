import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bistry — Le logiciel des ramoneurs professionnels",
    template: "%s | Bistry",
  },
  description:
    "Certificats de ramonage en 30 secondes, factures automatiques, planning par secteur, rappels annuels. Le seul outil dont votre entreprise de ramonage a besoin.",
  keywords: [
    "ramonage",
    "certificat ramonage",
    "logiciel ramoneur",
    "gestion ramonage",
    "certificat de ramonage PDF",
    "logiciel ramonage",
    "Bistry",
  ],
  authors: [{ name: "Bistry" }],
  creator: "Bistry",
  metadataBase: new URL("https://bistry.fr"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bistry",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://bistry.fr",
    siteName: "Bistry",
    title: "Bistry — Le logiciel des ramoneurs professionnels",
    description:
      "Certificats, factures, planning, rappels — tout votre métier de ramoneur dans un seul outil. Essai gratuit 14 jours.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bistry — Logiciel de gestion pour ramoneurs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bistry — Le logiciel des ramoneurs professionnels",
    description:
      "Certificats, factures, planning, rappels — tout votre métier de ramoneur dans un seul outil.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f2b46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
