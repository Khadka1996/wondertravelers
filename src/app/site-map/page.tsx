import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sitemap - WONDER Travelers',
  description: 'Sitemap of all pages and content on WONDER Travelers',
  robots: {
    index: true,
    follow: true,
  },
};

export default function SitemapPage() {
  const sections = [
    {
      title: 'Main Pages',
      links: [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
      ],
    },
    {
      title: 'Content',
      links: [
        { href: '/blog', label: 'Travel Blog' },
        { href: '/explore', label: 'Explore Destinations' },
        { href: '/gallery', label: 'Photo Gallery' },
        { href: '/videos', label: 'Documentaries & Videos' },
        { href: '/pictures', label: 'Pictures' },
        { href: '/news', label: 'News & Updates' },
      ],
    },
    {
      title: 'User Resources',
      links: [
        { href: '/profile', label: 'User Profile' },
        { href: '/author', label: 'Authors' },
      ],
    },
    {
      title: 'XML Sitemaps',
      links: [
        { href: '/sitemap.xml', label: 'Main Sitemap' },
        { href: '/sitemap-blogs.xml', label: 'Blog Posts Sitemap' },
        { href: '/sitemap-destinations.xml', label: 'Destinations Sitemap' },
        { href: '/sitemap-videos.xml', label: 'Videos Sitemap' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Sitemap</h1>
        <p className="text-lg text-slate-600 mb-8">
          Browse all pages on WONDER Travelers. For search engines, see our{' '}
          <Link href="/sitemap.xml" className="text-cyan-600 hover:text-cyan-700 underline">
            XML sitemap
          </Link>
          .
        </p>

        <div className="grid gap-8">
          {sections.map((section) => (
            <section key={section.title} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-3">About This Sitemap</h3>
          <p className="text-slate-600 mb-2">
            This page provides a human-readable map of all content available on WONDER Travelers. Use the links
            above to navigate to different sections.
          </p>
          <p className="text-slate-600">
            Search engines use our XML sitemaps located in the links above to discover and index all our content
            efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
