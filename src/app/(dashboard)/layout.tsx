import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import '../globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import { LocationMemory } from '@/components/LocationMemory';
import ClearTranslateCookie from '@/components/ClearTranslateCookie';
import { baseUrl } from '@/components/SiteHead';
import { generateViewportMetadata } from '@/utils/seoUtils';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const viewport: Viewport = generateViewportMetadata();

// Dashboards and sign-in pages are English only and never indexed.
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'WONDER Travelers',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased notranslate`} suppressHydrationWarning>
        <ClearTranslateCookie />
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <LocationMemory />
            </Suspense>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
