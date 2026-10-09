'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/app/components/Header/Navbar';
import Footer from '@/app/components/Footer/Footer';
import PremiumAdSection from '@/components/PremiumAdSection';
import { splitLocale } from '@/i18n/config';

/** Header, footer and the site-wide ad strip around every public page. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const isHome = splitLocale(usePathname()).path === '/';
  return (
    <>
      <Navbar />
      {/* The home page places its own ad section below the hero. */}
      {!isHome && <PremiumAdSection />}
      <main>{children}</main>
      <Footer />
    </>
  );
}
