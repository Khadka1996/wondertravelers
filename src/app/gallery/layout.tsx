import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Gallery - Wonder Travelers Photo Collection',
  description:
    'Explore the Wonder Travelers gallery with professional Nepal travel photography, landscapes, culture, and destination highlights.',
  keywords:
    'Wonder Travelers gallery, Nepal travel photos, Nepal photography, travel gallery, destination images',
  slug: '/gallery',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
