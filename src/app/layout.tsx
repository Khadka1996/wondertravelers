import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ToastProvider";
import { LocationMemory } from "@/components/LocationMemory";
import ConditionalLayout from "@/components/ConditionalLayout";
import { generateViewportMetadata } from "@/utils/seoUtils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wondertravelers.com";

export const metadata: Metadata = {
  title: "WONDER Travelers - Nepal Travel Guide, Destinations & Travel Blog",
  description: "Discover 50+ amazing destinations in Nepal with professional travel guides, photography, documentaries, and authentic travel stories. Plan your Nepal adventure.",
  keywords: "Nepal travel, travel guide, destinations, tourism, hiking, trekking, photography, travel blog, travel documentaries",
  authors: [{ name: "WONDER Travelers", url: baseUrl }],
  creator: "WONDER Travelers",
  publisher: "WONDER Travelers",
  formatDetection: {
    email: true,
    telephone: true,
    address: true,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "WONDER Travelers",
    title: "WONDER Travelers - Nepal Travel Guide & Destinations",
    description: "Discover 50+ amazing destinations in Nepal with professional travel guides, photography, documentaries, and authentic travel stories.",
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: "WONDER Travelers",
        type: "image/png",
      },
      {
        url: `${baseUrl}/hero-background.jpg`,
        width: 1200,
        height: 630,
        alt: "Nepal Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WONDER Travelers - Nepal Travel Guide",
    description: "Discover 50+ amazing destinations in Nepal with professional travel guides and documentaries.",
    creator: "@wondertravelers",
    images: [`${baseUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WONDER Travelers",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export const viewport: Viewport = generateViewportMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WONDER Travelers",
    url: "https://wondertravelers.com",
    image: "https://wondertravelers.com/logo.png",
    description:
      "Discover 50+ amazing destinations in Nepal with professional travel guides, photography, documentaries, and authentic travel stories.",
    sameAs: [
      "https://www.facebook.com/share/17gYmw6MMW/",
      "https://www.instagram.com/wond_ertravelers?igsh=MXFsaTg2bGdqZDh0Ng==",
      "https://www.tiktok.com/@wonder.travelers?_r=1&_t=ZS-94nNvCFf8St",
      "https://x.com/WonderTrav90995",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressRegion: "Kathmandu",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "General",
        email: "wondertravelsnepal@gmail.com",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <LocationMemory />
            </Suspense>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}