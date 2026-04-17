import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com';

export const metadata: Metadata = {
  title: 'WONDER Travelers - Nepal Travel Guide, Destinations & Travel Blog',
  description:
    'Discover 50+ amazing destinations in Nepal with professional travel guides, photography, documentaries, and authentic travel stories. Plan your Nepal adventure.',
  keywords:
    'Nepal travel, travel guide, destinations, tourism, hiking, trekking, photography, travel blog, travel documentaries',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'WONDER Travelers',
    title: 'WONDER Travelers - Nepal Travel Guide & Destinations',
    description:
      'Discover 50+ amazing destinations in Nepal with professional travel guides, photography, documentaries, and authentic travel stories.',
    images: [
      {
        url: `${baseUrl}/hero-background.jpg`,
        width: 1200,
        height: 630,
        alt: 'Nepal Travel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WONDER Travelers - Nepal Travel Guide',
    description: 'Discover 50+ amazing destinations in Nepal with professional travel guides and documentaries.',
    creator: '@wondertravelers',
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WONDER Travelers',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/explore?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Photography Gallery',
        description: 'Browse 200+ professional photos',
        url: `${baseUrl}/photos`,
      },
      {
        '@type': 'Offer',
        name: 'Destinations',
        description: 'Explore 50+ destinations in Nepal',
        url: `${baseUrl}/explore`,
      },
      {
        '@type': 'Offer',
        name: 'Travel Blog',
        description: 'Read travel stories and guides',
        url: `${baseUrl}/blog`,
      },
      {
        '@type': 'Offer',
        name: 'Documentaries',
        description: 'Watch travel documentaries',
        url: `${baseUrl}/videos`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      {children}
    </>
  );
}
