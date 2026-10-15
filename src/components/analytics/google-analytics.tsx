import Script from "next/script";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Loads Google Analytics only when a GA4 measurement ID is configured.
 * Keep this in the root layout so every public route records a page view.
 */
export function GoogleAnalytics() {
  if (!measurementId) {
    return null;
  }

  const analyticsSource = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  const analyticsSetup = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', ${JSON.stringify(measurementId)});
  `;

  return (
    <>
      <Script src={analyticsSource} strategy="afterInteractive" />
      <Script id="google-analytics-config" strategy="afterInteractive">
        {analyticsSetup}
      </Script>
    </>
  );
}
