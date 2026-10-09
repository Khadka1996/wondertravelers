import { Metadata, Viewport } from 'next';
import { defaultLocale, locales, ogLocales, type Locale } from '@/i18n/config';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com').replace(/\/$/, '');
export const DEFAULT_OG_IMAGE = `${baseUrl}/og-image.jpg`;

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  /** Path without the language prefix, e.g. '/blog' ('' for the home page). */
  slug: string;
  locale?: Locale;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'video' | 'image';
  author?: string;
  publishedDate?: Date;
  modifiedDate?: Date;
  noIndex?: boolean;
}

/** Absolute URLs of a page in every language, plus x-default (English). */
export function languageAlternates(slug: string): Record<string, string> {
  const path = slug === '/' ? '' : slug;
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}${path}`]));
  languages['x-default'] = `${baseUrl}/${defaultLocale}${path}`;
  return languages;
}

export function generateSEOMetadata(props: SEOProps): Metadata {
  const {
    title,
    description,
    keywords = '',
    slug,
    locale = defaultLocale,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    author,
    publishedDate,
    modifiedDate,
    noIndex = false,
  } = props;

  const path = slug === '/' ? '' : slug;
  const url = `${baseUrl}/${locale}${path}`;
  const validOgType: 'website' | 'article' = ogType === 'article' ? 'article' : 'website';

  return {
    title,
    description,
    keywords: keywords || undefined,
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      type: validOgType,
      locale: ogLocales[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
      url,
      siteName: 'WONDER Travelers',
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      publishedTime: publishedDate?.toISOString(),
      modifiedTime: modifiedDate?.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
  };
}

/**
 * BreadcrumbList for a page: Home > ... > current. `trail` paths are without
 * the language prefix. Google shows these instead of the raw URL in results.
 */
export function breadcrumbSchema(locale: Locale, homeName: string, trail: { name: string; path: string }[]) {
  const items = [{ name: homeName, path: '' }, ...trail];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}/${locale}${item.path}`,
    })),
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
