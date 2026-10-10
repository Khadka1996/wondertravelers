import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiTiktok } from 'react-icons/si';
import { socialProfiles, type SocialKey } from '@/lib/social';

const ICONS: Record<SocialKey, { icon: React.ComponentType<{ size?: number }>; color: string }> = {
  facebook: { icon: FaFacebookF, color: 'bg-[#1877F2] hover:bg-[#1462c9]' },
  x: { icon: FaXTwitter, color: 'bg-black hover:bg-neutral-800' },
  instagram: { icon: FaInstagram, color: 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:brightness-110' },
  youtube: { icon: FaYoutube, color: 'bg-[#FF0000] hover:bg-[#d60000]' },
  tiktok: { icon: SiTiktok, color: 'bg-black hover:bg-neutral-800' },
};

/** Round brand-coloured buttons for every social profile. */
export default function SocialIcons({ size = 36, iconSize = 16 }: { size?: number; iconSize?: number }) {
  return (
    <ul className="flex flex-wrap items-center gap-2.5">
      {socialProfiles.map(({ key, label, href }) => {
        const { icon: Icon, color } = ICONS[key];
        return (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={label}
              title={label}
              style={{ width: size, height: size }}
              className={`flex items-center justify-center rounded-full text-white shadow-sm transition-transform hover:-translate-y-0.5 ${color}`}
            >
              <Icon size={iconSize} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
