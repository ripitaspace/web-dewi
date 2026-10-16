import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { UmamiAnalytics } from "@/components/analytics/umami-analytics";
import { VisitorStamp } from "@/components/analytics/visitor-stamp";
import { ConnectionNotice } from "@/components/system-state/connection-notice";
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
    <html lang="id" data-ripita-loader="skip">
      <body>
        <ConnectionNotice />
        <div data-ripita-page-content>{children}</div>
        <GoogleAnalytics />
        <UmamiAnalytics />
        <VisitorStamp />
      </body>
    </html>
  );
}
