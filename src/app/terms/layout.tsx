import { Metadata } from 'next';
import { generateSEOMetadata } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Terms of Service - WONDER Travelers',
  description: 'Read WONDER Travelers\' terms of service to understand the rules and guidelines for using our website and services.',
  keywords: 'terms of service, terms and conditions, user agreement, legal terms',
  slug: '/terms',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
