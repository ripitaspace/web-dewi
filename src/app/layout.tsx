import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { VisitorStamp } from "@/components/analytics/visitor-stamp";
import { RipitaLoaderBootstrap } from "@/components/brand/ripita-loader-bootstrap";
import { RipitaSignatureLoader } from "@/components/brand/ripita-signature-loader";
import "./globals.css";

const loaderBootstrap = `
  (() => {
    try {
      const isDemo = window.location.pathname === "/karya/ripita-motion";
      const hasSeenLoader = window.sessionStorage.getItem("ripita:signature-seen:v1") === "1";
      document.documentElement.dataset.ripitaLoader = isDemo || hasSeenLoader ? "skip" : "pending";
    } catch {
      document.documentElement.dataset.ripitaLoader = "pending";
    }
  })();
`;

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
    <html lang="id" suppressHydrationWarning>
      <head>
        <RipitaLoaderBootstrap html={loaderBootstrap} />
      </head>
      <body>
        <RipitaSignatureLoader />
        <div data-ripita-page-content>{children}</div>
        <GoogleAnalytics />
        <VisitorStamp />
      </body>
    </html>
  );
}
