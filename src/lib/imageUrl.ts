// Sizes the Next.js optimizer accepts (next.config.ts deviceSizes + imageSizes).
const WIDTHS = [64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920] as const;

/**
 * Plain <img> tags load the original upload (often 1 MB). This routes our own
 * images through /_next/image, which resizes them to `width`, serves WebP/AVIF
 * and caches the result. Anything else (data:, other sites) is returned as is.
 */
export function optimizedImage(src: string | null | undefined, width = 828, quality = 75): string {
  if (!src) return '';
  const local = src.startsWith('/uploads/') || /^https:\/\/(www\.|api\.)?wondertravelers\.com\/uploads\//.test(src);
  if (!local) return src;
  const path = src.replace(/^https:\/\/[^/]+/, '');
  const w = WIDTHS.find((size) => size >= width) ?? 1920;
  return `/_next/image?url=${encodeURIComponent(path)}&w=${w}&q=${quality}`;
}

/** Same for every /uploads image inside article HTML. */
export function optimizeHtmlImages(html: string, width = 1080): string {
  return html.replace(/(<img\b[^>]*?\bsrc=")([^"]+)(")/g, (_m, before: string, src: string, after: string) =>
    `${before}${optimizedImage(src, width).replace(/&/g, '&amp;')}${after}`,
  );
}
