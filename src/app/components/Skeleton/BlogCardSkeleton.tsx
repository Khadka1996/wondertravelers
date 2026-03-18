/**
 * Facebook-style skeleton loader for blog cards
 * Matches the visual structure of blog cards while loading
 */
export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-slate-200" />

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Category badge skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
        </div>

        {/* Title skeleton - 2 lines */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/5" />
        </div>

        {/* Description skeleton - 2 lines */}
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-4/5" />
        </div>

        {/* Meta info skeleton */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            {/* Author and date skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-slate-200 rounded-full" />
              <div className="h-3 bg-slate-200 rounded w-20" />
            </div>
            <div className="h-3 bg-slate-200 rounded w-16" />
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="pt-4 flex gap-2">
          <div className="flex-1 h-10 bg-slate-200 rounded-lg" />
          <div className="flex-1 h-10 bg-slate-200 rounded-lg" />
          <div className="flex-1 h-10 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton loaders
 */
export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Header skeleton for author section
 */
export function AuthorHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-slate-200 to-slate-300 text-white py-16 px-4 animate-pulse">
      <div className="max-w-6xl mx-auto flex items-center gap-8">
        {/* Author image skeleton */}
        <div className="w-32 h-32 flex-shrink-0 bg-slate-300 rounded-full" />
        
        <div className="flex-1 space-y-3">
          {/* Author name skeleton */}
          <div className="h-8 bg-slate-300 rounded w-64" />
          
          {/* Verified badge skeleton */}
          <div className="h-4 bg-slate-300 rounded w-32" />
          
          {/* Bio skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-slate-300 rounded w-full" />
            <div className="h-3 bg-slate-300 rounded w-4/5" />
          </div>
          
          {/* Stats skeleton */}
          <div className="flex gap-4 pt-2">
            <div className="bg-slate-300/20 px-4 py-2 rounded-lg">
              <div className="h-3 bg-slate-300 rounded w-16 mb-1" />
              <div className="h-6 bg-slate-300 rounded w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Banner ad skeleton
 */
export function AdBannerSkeleton() {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg bg-slate-200 animate-pulse aspect-[21/4]" />
  );
}
