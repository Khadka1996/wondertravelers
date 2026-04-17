import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Explore Nepal Destinations - 50+ Travel Guides | WONDER Travelers',
  description:
    'Discover and explore 50+ amazing destinations in Nepal. Find travel guides, ratings, directions, and tips for popular places to visit.',
  keywords:
    'Nepal destinations, travel guide, places to visit, tourist attractions, trekking, hiking, cultural sites, adventure, Nepal tourism',
  slug: '/explore',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
