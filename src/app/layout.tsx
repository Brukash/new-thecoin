import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.shortName} | ${site.name}`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  keywords: [
    "CBN Cooperative",
    "CBN Staff Multipurpose Cooperative Society",
    "cooperative society Nigeria",
    "cooperative loans",
    "thrift and credit",
    "cooperative housing Nigeria",
    "property ownership Abuja",
    "coop investment fund",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: site.url,
    siteName: site.name,
    title: `${site.name}`,
    description: site.description,
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "finance",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

/**
 * Browser chrome colour, matching the institutional navy in globals.css.
 * Kept in viewport (not metadata) per the Next.js 15 API.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a1628" },
    { media: "(prefers-color-scheme: dark)", color: "#08101f" },
  ],
};

const organisationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.legalName,
  alternateName: site.shortName,
  url: site.url,
  logo: `${site.url}/images/logo.png`,
  description: site.description,
  email: site.contact.emails[0].value,
  telephone: site.contact.phones.map((phone) => `+234${phone.value.replace(/\s/g, "").slice(1)}`),
  address: {
    "@type": "PostalAddress",
    streetAddress: "No. 9, Zaria Street, Garki II, CBN Quarters",
    addressLocality: "Abuja",
    addressRegion: "FCT",
    addressCountry: "NG",
  },
  sameAs: site.social.map((channel) => channel.href),
  areaServed: "Nigeria",
  knowsAbout: [
    "Cooperative savings",
    "Thrift and credit",
    "Cooperative housing",
    "Investment funds",
    "Wealth management",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  inLanguage: "en-NG",
  publisher: { "@type": "Organization", name: site.legalName },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-paper antialiased" suppressHydrationWarning>
        {children}

        <script
          type="application/ld+json"
          // Schema data is static and authored here, never user supplied.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organisationSchema, websiteSchema]),
          }}
        />
      </body>
    </html>
  );
}
