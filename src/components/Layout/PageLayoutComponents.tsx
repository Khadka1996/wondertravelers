/**
 * Reusable Page Layout Components
 * Ensures consistent styling across all pages
 */

import { ReactNode } from 'react';
import { LAYOUT } from '@/utils/layoutConstants';

interface PageWrapperProps {
  children: ReactNode;
  bgColor?: 'white' | 'slate-50' | 'gradient';
}

export function PageWrapper({ children, bgColor = 'white' }: PageWrapperProps) {
  const bgClass = {
    white: 'bg-white',
    'slate-50': 'bg-slate-50',
    gradient: 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100',
  }[bgColor];

  return <main className={`${LAYOUT.minHeight} ${bgClass}`}>{children}</main>;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  align?: 'left' | 'center';
}

export function PageHero({
  title,
  subtitle,
  children,
  align = 'center',
}: PageHeroProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <section className={`${LAYOUT.pageTop} ${LAYOUT.pageBottom} ${LAYOUT.containerPadding} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900`}>
      <div className={`${LAYOUT.containerMaxWidth} mx-auto ${alignClass}`}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

interface PageSectionProps {
  children: ReactNode;
  bgColor?: 'white' | 'slate-50';
  padding?: 'sm' | 'md' | 'lg';
}

export function PageSection({
  children,
  bgColor = 'white',
  padding = 'md',
}: PageSectionProps) {
  const bgClass = {
    white: 'bg-white',
    'slate-50': 'bg-slate-50',
  }[bgColor];

  const paddingClass =
    {
      sm: 'py-6 sm:py-8',
      md: 'py-8 sm:py-12',
      lg: 'py-12 sm:py-16',
    }[padding] || 'py-8 sm:py-12';

  return (
    <section className={`${bgClass} ${paddingClass} ${LAYOUT.containerPadding}`}>
      <div className={LAYOUT.containerMaxWidth + ' mx-auto'}>{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({
  title,
  subtitle,
  align = 'center',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`mb-8 sm:mb-12 ${alignClass}`}>
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface GridContainerProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export function GridContainer({ children, cols = 2, gap = 'md' }: GridContainerProps) {
  const colClass = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[cols];

  const gapClass = {
    sm: 'gap-4',
    md: 'gap-6 md:gap-8',
    lg: 'gap-8 md:gap-12',
  }[gap];

  return (
    <div className={`grid grid-cols-1 ${colClass} ${gapClass}`}>
      {children}
    </div>
  );
}

interface ContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({ children, maxWidth = 'lg' }: ContainerProps) {
  const maxWidthClass = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'w-full',
  }[maxWidth];

  return <div className={`${maxWidthClass} mx-auto`}>{children}</div>;
}
