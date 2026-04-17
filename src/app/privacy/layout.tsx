import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy Policy - WONDER Travelers',
  description: 'Read WONDER Travelers\' privacy policy to understand how we collect, use, and protect your personal information.',
  keywords: 'privacy policy, data protection, privacy, GDPR, user privacy',
  slug: '/privacy',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
