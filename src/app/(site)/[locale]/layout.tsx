import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import '../../globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import { LocationMemory } from '@/components/LocationMemory';
import PageViewTracker from '@/components/PageViewTracker';
import SiteChrome from '@/components/SiteChrome';
import SiteHead, { baseUrl } from '@/components/SiteHead';
import GoogleTranslate from '@/components/GoogleTranslate';
import ClearTranslateCookie from '@/components/ClearTranslateCookie';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { DEFAULT_OG_IMAGE, generateViewportMetadata } from '@/utils/seoUtils';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

// Only /en and /ne exist; anything else is a 404 (middleware redirects
// unprefixed paths to a language first).
export const dynamicParams = false;
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export const viewport: Viewport = generateViewportMetadata();

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).meta.home;
  // Site-wide defaults only. Canonical/hreflang are set per page, so a page
  // that forgot its metadata never claims to be the home page.
  return {
    metadataBase: new URL(baseUrl),
    title: t.title,
    description: t.description,
    applicationName: 'WONDER Travelers',
    openGraph: { siteName: 'WONDER Travelers', images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }] },
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <head>
        <SiteHead locale={locale} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {locale === 'ne' ? <GoogleTranslate /> : <ClearTranslateCookie />}
        <LocaleProvider locale={locale}>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <LocationMemory />
              </Suspense>
              <PageViewTracker />
              <SiteChrome>{children}</SiteChrome>
            </ToastProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
