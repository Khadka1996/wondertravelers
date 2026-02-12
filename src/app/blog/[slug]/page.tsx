// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, Eye, ChevronRight, Clock, Tag, Share2, 
  Bookmark, Heart, Facebook, Twitter, Linkedin, Link2
} from "lucide-react";

// Types
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  views: string;
  category: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  readTime: string;
  tags: string[];
}

// Trending blogs data
const TRENDING_BLOGS = [
  {
    id: 6,
    title: "10-Day Perfect Nepal Itinerary for First-Time Visitors",
    slug: "10-day-nepal-itinerary-first-timers",
    views: "32.1K views",
    image: "/photos/annapurna-range.jpg",
  },
  {
    id: 4,
    title: "Best Time to Visit Nepal: Month-by-Month Weather Guide",
    slug: "best-time-visit-nepal-weather",
    views: "21.3K views",
    image: "/photos/rara-lake.jpg",
  },
  {
    id: 3,
    title: "A Food Lover's Guide to Nepali Street Food in Kathmandu",
    slug: "nepali-street-food-kathmandu",
    views: "15.7K views",
    image: "/photos/bhaktapur-temple.jpg",
  },
  {
    id: 1,
    title: "Top 10 Hidden Gems in Nepal You Must Visit in 2025",
    slug: "top-10-hidden-gems-nepal-2025",
    views: "12.4K views",
    image: "/photos/everest-sunrise.jpg",
  },
  {
    id: 5,
    title: "Paragliding in Pokhara: What to Expect & Safety Tips",
    slug: "paragliding-pokhara-guide",
    views: "9.8K views",
    image: "/photos/langtang-valley.jpg",
  },
];

// Full blog data with content
const BLOG_POSTS: Record<string, BlogPost> = {
  "paragliding-pokhara-guide": {
    id: 5,
    title: "Paragliding in Pokhara: What to Expect & Safety Tips",
    slug: "paragliding-pokhara-guide",
    excerpt: "Soaring above Phewa Lake with panoramic Himalayan views — complete guide for first-timers.",
    content: `
      <p class="text-lg text-slate-700 leading-relaxed mb-6">Pokhara is Nepal's ultimate adventure hub, and paragliding is the crown jewel of its adrenaline offerings. Soaring above Phewa Lake with the Annapurna range as your backdrop is an experience that borders on spiritual.</p>
      
      <!-- Ad 1: Native Banner Ad -->
      <div class="my-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold text-blue-700 uppercase tracking-wider">Sponsored</span>
              <span class="text-xs text-slate-400">•</span>
              <span class="text-xs text-slate-500">Adventure Partners</span>
            </div>
            <h4 class="font-bold text-slate-900 text-lg mb-1">Book Your Paragliding Adventure</h4>
            <p class="text-sm text-slate-600 mb-2">Special discount for Wonder Travelers readers. 15% off on all tandem flights!</p>
            <div class="flex items-center gap-3">
              <a href="https://www.pokharaparagliding.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                Book Now <ChevronRight size={14} />
              </a>
              <span class="text-xs text-slate-500">Use code: WONDER15</span>
            </div>
          </div>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Best Time for Paragliding</h2>
      <p>The prime paragliding season in Pokhara runs from September to November and March to May. During these months, thermals are stable, visibility is crystal clear, and wind conditions are perfect for long, smooth flights. Winter (December-February) can be cold but offers stunning snow-capped views, while monsoon (June-August) is generally avoided due to rain and unstable air.</p>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">What to Expect</h2>
      <p>A typical tandem flight lasts 20-30 minutes, though you can opt for extended flights up to 45-60 minutes. You'll be harnessed to an experienced pilot who controls the canopy while you simply sit back, enjoy the view, and maybe even take the controls for a few minutes if you're feeling adventurous.</p>
      
      <p class="mt-3">The takeoff is from Sarangkot Hill (1,592m), a 30-minute drive from Lakeside. The moment your feet leave the ground, you're greeted by absolute silence — just the wind and the Himalayas. The landing is gentle, right by the shore of Phewa Lake.</p>
      
      <!-- Ad 2: Full Width Banner -->
      <div class="my-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div class="relative aspect-[21/7]">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
          <div class="absolute inset-0 flex items-center">
            <div class="px-6 md:px-10 max-w-xl">
              <span class="inline-block px-3 py-1 bg-blue-500/20 backdrop-blur-sm text-blue-200 text-xs font-medium rounded-full mb-3">Limited Time Offer</span>
              <h4 class="text-white font-bold text-xl md:text-2xl mb-2">Travel Insurance Nepal</h4>
              <p class="text-white/80 text-sm md:text-base mb-4">Get covered for paragliding, trekking & adventure sports. Instant e-policy.</p>
              <div class="flex items-center gap-3">
                <a href="https://www.himalayan-insurance.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-5 py-2.5 bg-white hover:bg-blue-50 text-slate-900 rounded-lg text-sm font-medium transition-colors shadow-lg">
                  Get Quote <ChevronRight size={16} />
                </a>
                <span class="text-white/60 text-xs">Starting at $2.5/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Safety First</h2>
      <p>Safety standards in Pokhara have improved dramatically. Choose operators certified by the Nepal Association of Rafting Agencies (NARA) or the Nepal Mountaineering Association (NMA). Always check that your pilot has a valid license and that equipment is well-maintained.</p>
      
      <div class="bg-amber-50 p-5 rounded-xl border border-amber-200 my-6">
        <div class="flex items-start gap-3">
          <AlertCircle size={20} class="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="font-semibold text-amber-800 mb-1">Pro Tip</h4>
            <p class="text-sm text-amber-700">Ask your operator about their safety record and if they conduct regular equipment checks. Reputable companies are happy to share this information.</p>
          </div>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">What to Wear</h2>
      <p>Comfortable athletic wear is perfect — think yoga or hiking clothes. Sneakers are mandatory (no sandals!). Even on sunny days, it's cooler at altitude, so bring a light jacket. Sunglasses are essential, and don't forget sunscreen — you're closer to the sun!</p>
      
      <!-- Ad 3: Compact Card Ad -->
      <div class="my-8 bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-xl">🏨</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-slate-900">Lakeside Resorts</h4>
              <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">20% OFF</span>
            </div>
            <p class="text-xs text-slate-500 mb-2">Stay near the paragliding landing spot. Exclusive discount for blog readers.</p>
            <a href="https://www.pokharahotels.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 text-xs font-medium hover:text-blue-700 inline-flex items-center gap-1">
              Check Availability <ChevronRight size={12} />
            </a>
          </div>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Cost and Booking</h2>
      <p>Standard tandem flights cost between $80-120 USD depending on duration and season. This includes hotel pickup/drop-off, equipment, and your pilot. Optional photo/video packages are usually an additional $25-35. Book at least a day in advance during peak season.</p>
      
      <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 my-8">
        <h3 class="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
          <span class="w-1.5 h-5 bg-blue-600 rounded-full"></span>
          Quick Checklist
        </h3>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <li class="flex items-start gap-2 text-sm text-slate-700">
            <span class="text-blue-600 font-bold">✓</span> Book with certified operator
          </li>
          <li class="flex items-start gap-2 text-sm text-slate-700">
            <span class="text-blue-600 font-bold">✓</span> Morning flights (7-9 AM)
          </li>
          <li class="flex items-start gap-2 text-sm text-slate-700">
            <span class="text-blue-600 font-bold">✓</span> Wear closed-toe shoes
          </li>
          <li class="flex items-start gap-2 text-sm text-slate-700">
            <span class="text-blue-600 font-bold">✓</span> Bring GoPro or buy photos
          </li>
          <li class="flex items-start gap-2 text-sm text-slate-700">
            <span class="text-blue-600 font-bold">✓</span> Don't eat heavy meal before
          </li>
          <li class="flex items-start gap-2 text-sm text-slate-700">
            <span class="text-blue-600 font-bold">✓</span> Arrive 15 mins early
          </li>
        </ul>
      </div>
      
      <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Is It Scary?</h2>
      <p>Honestly? The hardest part is the first step off the hill. There's no stomach-drop sensation like a roller coaster — it's more like floating. Most people describe it as peaceful rather than terrifying. If you're nervous, tell your pilot; they'll talk you through it and can even do a gentle, progressive takeoff.</p>
      
      <div class="bg-blue-50 p-5 rounded-lg border border-blue-200 my-6">
        <p class="text-sm text-blue-800 italic">
          "I was terrified of heights before trying paragliding in Pokhara. Now I've done it three times. The feeling of flying is absolutely liberating." — Sarah, Canada
        </p>
      </div>
      
      <p class="mt-4">Paragliding in Pokhara isn't just an activity; it's the closest humans can get to flying like birds. Don't leave Nepal without trying it at least once.</p>
    `,
    date: "Jan 15, 2025",
    views: "9.8K views",
    category: "Adventure",
    image: "/photos/langtang-valley.jpg",
    author: {
      name: "Prakash Sharma",
      avatar: "/avatars/author-1.jpg",
      bio: "Adventure travel writer and certified paragliding pilot based in Pokhara. 10+ years of flying experience with Blue Sky Paragliding.",
    },
    readTime: "9 min read",
    tags: ["Paragliding", "Pokhara", "Adventure Sports", "Nepal Travel", "Safety Tips", "Sarangkot"],
  },
  "nepali-street-food-kathmandu": {
    id: 3,
    title: "A Food Lover's Guide to Nepali Street Food in Kathmandu",
    slug: "nepali-street-food-kathmandu",
    excerpt: "From momos and chatpate to sel roti and yomari — where to find the best street food in the valley.",
    content: `
      <p class="text-lg text-slate-700 leading-relaxed mb-6">Kathmandu is a paradise for food lovers. The city's streets come alive with the sizzle of frying momos, the aroma of spicy chutneys, and the chatter of hungry locals. Here's your ultimate guide to eating like a Kathmandu local.</p>
      
      <!-- Ad 1: Food Tour Ad -->
      <div class="my-8 bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/3 bg-amber-600 p-6 flex items-center justify-center">
            <span class="text-white font-bold text-3xl">🍜</span>
          </div>
          <div class="flex-1 p-5">
            <span class="text-xs font-semibold text-amber-600 uppercase tracking-wider">Sponsored</span>
            <h4 class="font-bold text-slate-900 text-lg mb-1">Kathmandu Food Tour</h4>
            <p class="text-sm text-slate-600 mb-3">Join our 3-hour walking tour — taste 8 different street foods with a local guide.</p>
            <div class="flex items-center gap-2 mb-3">
              <div class="flex items-center gap-0.5">
                <span class="text-amber-500">★★★★★</span>
                <span class="text-xs text-slate-600 ml-1">(128 reviews)</span>
              </div>
            </div>
            <a href="https://www.foodtourkathmandu.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
              Book a Spot <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </div>
      
      <!-- Rest of food content... -->
    `,
    date: "Jan 28, 2025",
    views: "15.7K views",
    category: "Food & Culture",
    image: "/photos/bhaktapur-temple.jpg",
    author: {
      name: "Anita Thapa",
      avatar: "/avatars/author-2.jpg",
      bio: "Food writer and Newari cuisine specialist based in Patan. Author of 'Taste of Nepal' cookbook.",
    },
    readTime: "10 min read",
    tags: ["Street Food", "Kathmandu", "Nepali Cuisine", "Momos", "Food Guide"],
  },
  // Add more blog posts here...
};

// Ads configuration
const ADS = {
  sidebar: [
    {
      id: "sidebar_1",
      image: "/uploads/advertisement/blog-sidebar-1.gif",
      link: "https://www.himalayan-insurance.com",
      title: "Travel Insurance",
      description: "Adventure sports coverage available",
    },
    {
      id: "sidebar_2",
      image: "/uploads/advertisement/blog-sidebar-2.gif",
      link: "https://www.nepalairlines.com",
      title: "Nepal Airlines",
      description: "Fly direct to Pokhara & Kathmandu",
    },
    {
      id: "sidebar_3",
      image: "/uploads/advertisement/blog-sidebar-3.gif",
      link: "https://www.pokharahotels.com",
      title: "Lakeside Resorts",
      description: "20% off for blog readers",
    },
  ],
  topBanner: {
    image: "/uploads/advertisement/blog-top-banner.gif",
    link: "https://www.nepaltourism.com/offers",
  }
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({
    slug,
  }));
}

export default async function BlogPostPage({ params }: { params?: { slug?: string } }) {
  const resolvedParams = await params; // Ensure params is resolved

  if (!resolvedParams || !resolvedParams.slug) {
    console.error("Missing slug in params:", resolvedParams); // Debug log
    return notFound();
  }

  const slug = resolvedParams.slug.toLowerCase(); // Normalize slug for case-insensitive matching
  const post = BLOG_POSTS[slug];

  if (!post) {
    console.error(`Blog post not found for slug: ${slug}`); // Log missing slug
    return notFound();
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Top Banner Ad */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href={ADS.topBanner.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full"
          >
            <div className="relative w-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all aspect-21/4 bg-slate-100">
              <Image
                src={ADS.topBanner.image}
                alt="Advertisement"
                fill
                className="object-cover"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Article Content */}
          <article className="lg:col-span-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight size={14} />
              <Link href="/blog" className="hover:text-blue-600">Blog</Link>
              <ChevronRight size={14} />
              <Link href={`/blog/category/${post.category.toLowerCase()}`} className="hover:text-blue-600">{post.category}</Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock size={14} />
                  {post.readTime}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-lg text-slate-600 mb-6">
                {post.excerpt}
              </p>

              {/* Author & Meta */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                    <div className="absolute inset-0 bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                      {post.author.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{post.author.name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} />
                      <span>{post.date}</span>
                      <span>•</span>
                      <Eye size={14} />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <Share2 size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <Bookmark size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                    <Heart size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 shadow-md">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Article Content with Inline Ads */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center flex-wrap gap-2">
                <Tag size={16} className="text-slate-400" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3">Share this article</h4>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white transition-colors">
                  <Twitter size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center text-white transition-colors">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-600 hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                  <Link2 size={18} />
                </a>
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-6 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                  <div className="absolute inset-0 bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                    {post.author.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">About {post.author.name}</h4>
                  <p className="text-sm text-slate-600 mb-3">{post.author.bio}</p>
                  <Link 
                    href={`/author/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    More from this author <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Comments / Engagement */}
            <div className="mt-8 p-6 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-semibold text-slate-900 mb-4">Have you tried paragliding in Pokhara?</h4>
              <p className="text-sm text-slate-600 mb-4">Share your experience or ask questions below.</p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Post
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Trending Now */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                Trending Now
              </h3>
              <div className="space-y-4">
                {TRENDING_BLOGS.map((blog, index) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="flex items-start gap-3 group"
                  >
                    <span className="text-sm font-bold text-slate-300 group-hover:text-blue-600 transition-colors w-5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {blog.title}
                      </h4>
                      <span className="text-xs text-slate-500">{blog.views}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Ads */}
            {ADS.sidebar.map((ad) => (
              <Link
                key={ad.id}
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={ad.image}
                      alt={ad.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="text-xs text-white/70 uppercase tracking-wider mb-1 block">
                        Sponsored
                      </span>
                      <h4 className="text-white font-semibold mb-1">{ad.title}</h4>
                      <p className="text-white/80 text-xs mb-2">{ad.description}</p>
                      <span className="text-white text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn More <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-md">
              <h4 className="text-white font-bold text-lg mb-2">Get Weekly Updates</h4>
              <p className="text-white/90 text-sm mb-4">
                Join 15,000+ travelers. No spam, only Himalayas.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 rounded-lg border-0 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/60 focus:ring-2 focus:ring-white outline-none text-sm"
                />
                <button className="w-full px-4 py-2.5 bg-white text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors">
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-white/60 mt-3">
                Unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}