import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Nepal Photos - Professional Photography Gallery | WONDER Travelers',
  description:
    'Browse 200+ high-quality photos of Nepal\'s stunning landscapes, culture, and hidden gems. Professional photography gallery by WONDER Travelers.',
  keywords: 'Nepal photography, travel photos, landscape photography, cultural photos, Nepal pictures, photography gallery',
  slug: '/photos',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
