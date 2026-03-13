import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS-Pro — Gestion pour artisans",
  description: "Logiciel de gestion pour artisans et professions de niche",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
