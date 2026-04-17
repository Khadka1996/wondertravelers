import { Metadata } from 'next';
import { generateSEOMetadata, generateLocalBusinessSchema } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About WONDER Travelers - Nepal Travel Guides & Tourism',
  description:
    'Learn about WONDER Travelers - Nepal\'s leading platform for professional travel guides, photography, documentaries, and sustainable tourism. Meet our founder and discover our mission.',
  keywords:
    'about WONDER Travelers, Nepal travel, tourism company, travel guides, professional photography, documentaries',
  slug: '/about',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const organizationSchema = generateLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {children}
    </>
  );
}
