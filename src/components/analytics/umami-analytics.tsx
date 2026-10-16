import Script from "next/script";

/** Records page visits for the public PUSPITA × RIPITA website. */
export function UmamiAnalytics() {
  return (
    <Script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id="f6ba3346-085a-4deb-b34b-0ee40de870b8"
      strategy="afterInteractive"
    />
  );
}
