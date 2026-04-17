'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb component for navigation and SEO
 * Helps users understand site structure and improves internal linking
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm text-slate-600 py-4 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <ol className="flex items-center gap-2 flex-wrap max-w-6xl mx-auto">
        {/* Home link */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            {item.current || !item.href ? (
              <span className="text-slate-700 font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {/* Structured Data for Breadcrumbs */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com'}/`,
              },
              ...items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 2,
                name: item.label,
                ...(item.href && {
                  item: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://wondertravelers.com'}${item.href}`,
                }),
              })),
            ],
          }),
        }}
      />
    </nav>
  );
}

export default Breadcrumb;
