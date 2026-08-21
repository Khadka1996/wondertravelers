'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/app/components/Header/Navbar';
import Footer from '@/app/components/Footer/Footer';
import PremiumAdSection from '@/components/PremiumAdSection';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide header/footer for auth, admin, and moderator routes
  const isAuthRoute = pathname.startsWith('/auth');
  const isAdminRoute = pathname.startsWith('/admin');
  const isModeratorRoute = pathname.startsWith('/moderator');
  const isHomeRoute = pathname === '/';
  const hideHeaderFooter = isAuthRoute || isAdminRoute || isModeratorRoute;
  
  return (
    <>
      {!hideHeaderFooter && <Navbar />}
      {!hideHeaderFooter && !isHomeRoute && <PremiumAdSection />}
      <main>{children}</main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}
