import { Metadata, Viewport } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  slug: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'video' | 'image';
  author?: string;
  publishedDate?: Date;
  modifiedDate?: Date;
  canonicalUrl?: string;
}

export function generateSEOMetadata(props: SEOProps): Metadata {
  const {
    title,
    description,
    keywords = '',
    slug,
    ogImage,
    ogType = 'website',
    author,
    publishedDate,
    modifiedDate,
    canonicalUrl,
  } = props;

  const fullUrl = `${baseUrl}${slug}`;
  const canonical = canonicalUrl || fullUrl;
  
  // Filter ogType to only include valid values for Metadata openGraph
  const validOgType: 'website' | 'article' = (ogType === 'article' ? 'article' : 'website') as 'website' | 'article';

  return {
    title,
    description,
    keywords,
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      type: validOgType,
      locale: 'en_US',
      url: fullUrl,
      siteName: 'WONDER Travelers',
      title,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
      publishedTime: publishedDate?.toISOString(),
      modifiedTime: modifiedDate?.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@wondertravelers',
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateBreadcrumb(items: { name: string; url: string }[]): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WONDER Travelers',
    url: baseUrl,
    image: `${baseUrl}/logos.png`,
    description:
      'Discover 50+ amazing destinations in Nepal with professional travel guides, photography, documentaries, and authentic travel stories.',
    sameAs: [
      'https://www.facebook.com/wondertravelers',
      'https://www.instagram.com/wondertravelers',
      'https://www.youtube.com/wondertravelers',
      'https://twitter.com/wondertravelers',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
      addressRegion: 'Kathmandu',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'General',
      email: 'contact@wondertravelers.com',
    },
  };
}

export function generateBlogPostSchema(post: {
  title: string;
  description: string;
  image?: string;
  author: string;
  publishedDate: Date;
  modifiedDate?: Date;
  slug: string;
  keywords?: string;
}): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image ? [post.image] : undefined,
    datePublished: post.publishedDate.toISOString(),
    dateModified: post.modifiedDate?.toISOString() || post.publishedDate.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    url: `${baseUrl}/blog/${post.slug}`,
    keywords: post.keywords,
    isAccessibleForFree: true,
  };
}

export function generateDestinationSchema(destination: {
  name: string;
  description: string;
  image?: string;
  slug: string;
  rating?: number;
  address?: string;
  coordinates?: { lat: number; lng: number };
}): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: destination.name,
    description: destination.description,
    image: destination.image ? [destination.image] : undefined,
    url: `${baseUrl}/explore/${destination.slug}`,
    ...(destination.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: destination.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(destination.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: destination.address,
        addressCountry: 'NP',
      },
    }),
    ...(destination.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: destination.coordinates.lat,
        longitude: destination.coordinates.lng,
      },
    }),
  };
}

export function generateVideoSchema(video: {
  title: string;
  description: string;
  thumbnail?: string;
  uploadDate: Date;
  duration?: string;
  slug: string;
}): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnail,
    uploadDate: video.uploadDate.toISOString(),
    duration: video.duration,
    url: `${baseUrl}/videos/${video.slug}`,
  };
}

export function generateFAQSchema(questions: { question: string; answer: string }[]): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Generate viewport metadata for pages
 * Use this to set theme color and viewport settings
 */
export function generateViewportMetadata(): Viewport {
  return {
    themeColor: '#1f2937',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  };
}

export function generateLocalBusinessSchema(): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'WONDER Travelers',
    url: baseUrl,
    image: `${baseUrl}/logos.png`,
    description:
      'Professional travel guides and documentaries for Nepal tourism',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
      addressRegion: 'Kathmandu',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'General Services',
      telephone: '+977-1-XXXXXXX',
      email: 'contact@wondertravelers.com',
      areaServed: 'NP',
    },
  };
}
