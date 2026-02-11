"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight, Eye } from "lucide-react";

// Blog data – exactly 6 shown
const BLOGS = [
  {
    id: 1,
    title: "Top 10 Hidden Gems in Nepal You Must Visit in 2025",
    slug: "top-10-hidden-gems-nepal-2025",
    excerpt: "Beyond Everest and Pokhara — discover underrated destinations that offer authentic experiences...",
    date: "Feb 10, 2025",
    views: "12.4K views",
    category: "Travel Tips",
    image: "/photos/everest-sunrise.jpg",
  },
  {
    id: 2,
    title: "Sustainable Trekking: How to Leave No Trace in the Himalayas",
    slug: "sustainable-trekking-himalayas",
    excerpt: "Practical tips for eco-friendly trekking — responsible waste management...",
    date: "Feb 5, 2025",
    views: "8.2K views",
    category: "Sustainability",
    image: "/photos/annapurna-range.jpg",
  },
  {
    id: 3,
    title: "A Food Lover's Guide to Nepali Street Food in Kathmandu",
    slug: "nepali-street-food-kathmandu",
    excerpt: "From momos and chatpate to sel roti and yomari — where to find the best...",
    date: "Jan 28, 2025",
    views: "15.7K views",
    category: "Food & Culture",
    image: "/photos/bhaktapur-temple.jpg",
  },
  {
    id: 4,
    title: "Best Time to Visit Nepal: Month-by-Month Weather Guide",
    slug: "best-time-visit-nepal-weather",
    excerpt: "Planning your trip? Here's a detailed breakdown of seasons, festivals...",
    date: "Jan 20, 2025",
    views: "21.3K views",
    category: "Planning",
    image: "/photos/rara-lake.jpg",
  },
  {
    id: 5,
    title: "Paragliding in Pokhara: What to Expect & Safety Tips",
    slug: "paragliding-pokhara-guide",
    excerpt: "Soaring above Phewa Lake with panoramic Himalayan views...",
    date: "Jan 15, 2025",
    views: "9.8K views",
    category: "Adventure",
    image: "/photos/langtang-valley.jpg",
  },
  {
    id: 6,
    title: "10-Day Perfect Nepal Itinerary for First-Time Visitors",
    slug: "10-day-nepal-itinerary-first-timers",
    excerpt: "Kathmandu → Pokhara → Chitwan → Nagarkot — a balanced mix...",
    date: "Jan 8, 2025",
    views: "32.1K views",
    category: "Itineraries",
    image: "/photos/annapurna-range.jpg",
  },
];

// Top banner ad - position: blog_top
const TOP_BANNER_AD = {
  image: "/uploads/advertisement/blog-top-banner.gif",
  link: "https://www.nepaltourism.com/offers",
  position: "blog_top"
};

// Sidebar ads - 2 ads with position: blog_sidebar_1, blog_sidebar_2
const SIDEBAR_ADS = [
  {
    id: "sidebar_1",
    image: "/uploads/advertisement/blog-sidebar-1.gif",
    link: "https://www.himalayan-insurance.com",
    position: "blog_sidebar_1",
  },
  {
    id: "sidebar_2",
    image: "/uploads/advertisement/blog-sidebar-2.gif",
    link: "https://www.nepalairlines.com",
    position: "blog_sidebar_2",
  }
];

export default function BlogSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Blog Header - More descriptive for multiple blog posts */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Travel Stories & Nepal Guides
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            Insider tips, detailed itineraries, and authentic experiences from the heart of the Himalayas
          </p>
        </div>

        {/* Top banner ad - position: blog_top */}
        <div className="mb-10">
          <Link 
            href={TOP_BANNER_AD.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full"
          >
            <div className="relative w-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 aspect-[21/4]">
              <Image
                src={TOP_BANNER_AD.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority
              />
              {/* Position indicator - for development, remove in production */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-white/60 text-[10px] font-mono">
                {TOP_BANNER_AD.position}
              </div>
            </div>
          </Link>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Blog posts - 9 columns */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {BLOGS.map(blog => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group block h-full"
                >
                  <div className="relative h-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative h-44 md:h-48 w-full overflow-hidden">
                      <Image
                        src={blog.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-slate-800 shadow-sm">
                        {blog.category}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <Calendar size={12} />
                        <span>{blog.date}</span>
                        <span className="text-slate-300">•</span>
                        <Eye size={12} />
                        <span>{blog.views}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-2">
                        {blog.title}
                      </h3>

                      <p className="text-slate-600 text-xs line-clamp-2 mb-3">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center text-[#0284C7] text-xs font-medium group-hover:gap-1.5 transition-all">
                        Read More <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Browse All Articles
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* Sidebar - 2 ads with position: blog_sidebar_1, blog_sidebar_2 */}
          <aside className="lg:col-span-3">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
                {/* Advertisement header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Advertisement
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    sidebar
                  </span>
                </div>
                
                {/* 2 ads with tight gaps */}
                <div className="space-y-3">
                  {SIDEBAR_ADS.map((ad) => (
                    <Link
                      key={ad.id}
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full group"
                    >
                      <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all duration-200">
                        <div className="relative w-full aspect-[4/5]">
                          <Image
                            src={ad.image}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                          
                          {/* Position badge */}
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white/70 text-[8px] font-mono">
                            {ad.position}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Mobile view - visible only on small screens */}
                <div className="mt-3 pt-3 border-t border-slate-100 lg:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    {SIDEBAR_ADS.map((ad) => (
                      <Link
                        key={`mobile-${ad.id}`}
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full group"
                      >
                        <div className="relative w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          <div className="relative w-full aspect-square">
                            <Image
                              src={ad.image}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Advertise link */}
                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <Link 
                    href="/advertise" 
                    className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Advertise with us →
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}