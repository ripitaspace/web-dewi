import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { UmamiAnalytics } from "@/components/analytics/umami-analytics";
import { VisitorStamp } from "@/components/analytics/visitor-stamp";
import { ConnectionNotice } from "@/components/system-state/connection-notice";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "PuspitaCore menghadirkan tools pajak, sistem kerja, dan pembelajaran yang membantu pekerjaan terasa lebih tertata.",
  openGraph: {
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
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
        <JsonLd data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: absoluteUrl(),
            logo: absoluteUrl(DEFAULT_OG_IMAGE),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: absoluteUrl(),
            inLanguage: "id-ID",
          },
        ]} />
        <ConnectionNotice />
        <div data-ripita-page-content>{children}</div>
        <GoogleAnalytics />
        <UmamiAnalytics />
        <VisitorStamp />
      </body>
    </html>
  );
}
