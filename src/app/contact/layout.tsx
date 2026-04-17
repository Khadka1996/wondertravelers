import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Contact WONDER Travelers - Nepal Travel Support',
  description:
    'Get in touch with WONDER Travelers. We\'re here to help with travel questions, partnerships, advertising inquiries, and general support.',
  keywords: 'contact WONDER Travelers, travel support, partnership inquiries, advertising, customer service',
  slug: '/contact',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
