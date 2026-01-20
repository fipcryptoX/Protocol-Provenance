import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protocol Provenance - DeFi Sensemaking Dashboard",
  description: "Identify reputable DeFi protocols by pairing social credibility with onchain performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
