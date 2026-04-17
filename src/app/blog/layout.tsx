import { Metadata } from 'next';
import { generateSEOMetadata, generateFAQSchema } from '@/utils/seoUtils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Travel Blog - Nepal Adventure Stories & Tips | WONDER Travelers',
  description:
    'Read authentic travel stories, hiking guides, and tourism tips from Nepal. Discover travel experiences from WONDER Travelers\' writers and photographers.',
  keywords:
    'Nepal travel blog, travel stories, hiking guides, tourism tips, travel experiences, Nepal adventure',
  slug: '/blog',
  ogImage: 'https://wondertravelers.com/logos.png',
  ogType: 'website',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqSchema = generateFAQSchema([
    {
      question: 'How often are blog posts published?',
      answer:
        'We publish new travel stories and guides regularly, featuring authentic travel experiences and practical tips for exploring Nepal.',
    },
    {
      question: 'Can I contribute to the WONDER Travelers blog?',
      answer:
        'Yes! We welcome guest contributions from travel enthusiasts and photographers. Please contact us for collaboration opportunities.',
    },
    {
      question: 'Are the travel guides authentic?',
      answer:
        'All our content is created by experienced travelers and professionals who have personally visited the destinations featured in our blog.',
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
