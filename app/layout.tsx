import "./globals.css";
import Header from "./components/Header";
import CookieConsent from "./components/CookieConsent";
import Analytics from "./components/Analytics";
import type { Metadata } from "next";
import { siteDescription, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Garagem164 — Miniaturas 1:64 em Portugal",
    template: "%s | Garagem164",
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "/",
    siteName,
    title: "Garagem164 — Miniaturas 1:64 em Portugal",
    description: siteDescription,
    images: [
      {
        url: "/images/hero/backgrounds/garage-bg.webp",
        alt: "Garagem164 — marketplace de miniaturas 1:64",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garagem164 — Miniaturas 1:64 em Portugal",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": siteUrl + "/#organization",
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      areaServed: {
        "@type": "Country",
        name: "Portugal",
      },
      sameAs: ["https://www.instagram.com/garagem164_pt/"],
    },
    {
      "@type": "WebSite",
      "@id": siteUrl + "/#website",
      url: siteUrl,
      name: siteName,
      inLanguage: "pt-PT",
      publisher: {
        "@id": siteUrl + "/#organization",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <Header />
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
