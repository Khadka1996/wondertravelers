"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ChevronRight } from "lucide-react";

// Blog data – exactly 6 shown
const BLOGS = [
  {
    id: 1,
    title: "Top 10 Hidden Gems in Nepal You Must Visit in 2025",
    slug: "top-10-hidden-gems-nepal-2025",
    excerpt: "Beyond Everest and Pokhara — discover underrated destinations that offer authentic experiences...",
    date: "Feb 10, 2025",
    readTime: "7 min read",
    category: "Travel Tips",
    image: "/photos/everest-sunrise.jpg",
  },
  {
    id: 2,
    title: "Sustainable Trekking: How to Leave No Trace in the Himalayas",
    slug: "sustainable-trekking-himalayas",
    excerpt: "Practical tips for eco-friendly trekking — responsible waste management...",
    date: "Feb 5, 2025",
    readTime: "6 min read",
    category: "Sustainability",
    image: "/photos/annapurna-range.jpg",
  },
  {
    id: 3,
    title: "A Food Lover’s Guide to Nepali Street Food in Kathmandu",
    slug: "nepali-street-food-kathmandu",
    excerpt: "From momos and chatpate to sel roti and yomari — where to find the best...",
    date: "Jan 28, 2025",
    readTime: "5 min read",
    category: "Food & Culture",
    image: "/photos/bhaktapur-temple.jpg",
  },
  {
    id: 4,
    title: "Best Time to Visit Nepal: Month-by-Month Weather Guide",
    slug: "best-time-visit-nepal-weather",
    excerpt: "Planning your trip? Here's a detailed breakdown of seasons, festivals...",
    date: "Jan 20, 2025",
    readTime: "8 min read",
    category: "Planning",
    image: "/photos/rara-lake.jpg",
  },
  {
    id: 5,
    title: "Paragliding in Pokhara: What to Expect & Safety Tips",
    slug: "paragliding-pokhara-guide",
    excerpt: "Soaring above Phewa Lake with panoramic Himalayan views...",
    date: "Jan 15, 2025",
    readTime: "6 min read",
    category: "Adventure",
    image: "/photos/langtang-valley.jpg",
  },
  {
    id: 6,
    title: "10-Day Perfect Nepal Itinerary for First-Time Visitors",
    slug: "10-day-nepal-itinerary-first-timers",
    excerpt: "Kathmandu → Pokhara → Chitwan → Nagarkot — a balanced mix...",
    date: "Jan 8, 2025",
    readTime: "9 min read",
    category: "Itineraries",
    image: "/photos/annapurna-range.jpg",
  },
];

// Top banner ad – long horizontal (just image + link)
const TOP_BANNER_AD = {
  image: "/photos/one.gif",
  link: "/offers/2025",
};

// Sidebar ads – 4 vertical images (just image + link)
const SIDEBAR_ADS = [
  {
    image: "/photos/annapurna-range.jpg",
    link: "https://example.com/insurance-nepal",
  },
  {
    image: "/photos/annapurna-range.jpg",
    link: "https://example.com/insurance-nepal",
  },
  {
    image: "/photos/annapurna-range.jpg",
    link: "https://example.com/insurance-nepal",
  },
  {
    image: "/photos/annapurna-range.jpg",
    link: "https://example.com/insurance-nepal",
  },
];

export default function BlogSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Top long horizontal banner ad – full width */}
        <div className="mb-12">
          <Link href={TOP_BANNER_AD.link} className="block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[21/5] md:aspect-[21/4] lg:aspect-[21/3]">
              <Image
                src={TOP_BANNER_AD.image}
                alt="Featured Offer"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Blog posts – 6 vertical */}
          <div className="lg:col-span-9">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#0284C7]">
              Latest Travel Stories & Guides
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {BLOGS.map(blog => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-48 md:h-56">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70" />

                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-800">
                      {blog.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                      <Calendar size={14} />
                      <span>{blog.date}</span>
                      <span>•</span>
                      <Clock size={14} />
                      <span>{blog.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-3">
                      {blog.title}
                    </h3>

                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                      {blog.excerpt}
                    </p>

                    <div className="flex items-center text-[#0284C7] font-medium text-sm group-hover:gap-2 transition-all">
                      Read More <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#0284C7] to-[#38BDF8] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:brightness-105 transition-all"
              >
                View All Stories
                <ChevronRight size={24} />
              </Link>
            </div>
          </div>

          {/* Sidebar – 4 ads, closely stacked */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24 space-y-3">
              {SIDEBAR_ADS.map((ad, index) => (
                <Link
                  key={index}
                  href={ad.link}
                  className="block rounded-xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] md:aspect-[4/5]">
                    <Image
                      src={ad.image}
                      alt="Advertisement"
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}