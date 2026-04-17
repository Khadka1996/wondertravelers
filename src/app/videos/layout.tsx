import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Nepal Videos & Documentaries | WONDER Travelers',
  description:
    'Watch professional documentaries and video guides about Nepal\'s tourism, culture, nature, and videography techniques. Stunning visual storytelling.',
  keywords: 'Nepal videos, documentaries, travel documentaries, video guides, Nepal tourism videos, travel vblogs, videography',
  slug: '/videos',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'video',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
