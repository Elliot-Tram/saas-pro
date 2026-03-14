import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bistry — Logiciel de gestion pour ramoneurs",
  description: "Certificats, factures, planning, clients — tout votre métier de ramoneur dans un seul outil.",
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
