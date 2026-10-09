import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WONDER Travelers - Nepal Travel Guide & Destinations',
    short_name: 'WONDER Travelers',
    description:
      'Discover 50+ amazing destinations in Nepal with professional travel guides, photography, documentaries, and authentic travel stories.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0284c7',
    categories: ['travel', 'lifestyle', 'photography'],
    icons: [
      { src: '/favicon.ico', sizes: '48x48 32x32 16x16', type: 'image/x-icon' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
