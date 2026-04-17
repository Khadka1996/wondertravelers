import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Nepal Tourism News & Updates | WONDER Travelers',
  description:
    'Stay updated with the latest news about Nepal tourism, travel trends, travel tips, and tourism industry updates from WONDER Travelers.',
  keywords: 'Nepal news, tourism news, travel news, Nepal updates, tourism trends, travel tips',
  slug: '/news',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
