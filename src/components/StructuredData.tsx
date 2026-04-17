'use client';

import { ReactNode } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
  type?: 'application/ld+json';
}

/**
 * StructuredData component for rendering JSON-LD schema markup
 * Improves SEO by providing semantic information to search engines
 */
export function StructuredData({ data, type = 'application/ld+json' }: StructuredDataProps): ReactNode {
  if (!data) return null;

  return (
    <script
      type={type}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
      suppressHydrationWarning
    />
  );
}

export default StructuredData;
