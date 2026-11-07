import Script from "next/script";

/**
 * Google Analytics 4, loaded only when a measurement ID is configured.
 *
 * The ID lives in the environment (`NEXT_PUBLIC_GA_ID`) rather than in source,
 * so preview builds and local development never report into the Society's
 * property. IP anonymisation is on and advertising features are left off: this
 * is a brochure site, not a remarketing funnel.
 *
 * Nothing renders when the variable is absent, which is the default here —
 * there is no tracking until the Society supplies its own measurement ID.
 */
export function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
