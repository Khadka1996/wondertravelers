// The one list of social profiles: top bar, footer and Organization schema.
export const socialProfiles = [
  { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/share/17gYmw6MMW/' },
  { key: 'x', label: 'X (Twitter)', href: 'https://x.com/WonderTrav90995' },
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/wond_ertravelers/' },
  { key: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@WonderTravelers' },
  { key: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@wonder.travelers' },
] as const;

export type SocialKey = (typeof socialProfiles)[number]['key'];
