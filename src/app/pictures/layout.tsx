import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Nepal Pictures & Travel Photography | WONDER Travelers',
  description:
    'View stunning pictures of Nepal\'s natural beauty, cultural heritage, and travel destinations. Full resolution photography for inspiration and planning.',
  keywords: 'Nepal pictures, travel photography, high resolution images, landscape pictures, cultural photography, scenic views',
  slug: '/pictures',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
