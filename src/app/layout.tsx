import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PUSPITA × RIPITA — Kinetic Hero Prototype",
  description:
    "Prototype kinetic hero PUSPITA × RIPITA: rasa menjadi rupa, ide menjadi sistem.",
};

export const viewport: Viewport = {
  themeColor: "#F3E7D3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
