/**
 * Standardized Layout Constants for WONDER Travelers
 * Ensures consistent spacing, widths, and alignment across all pages
 */

export const LAYOUT = {
  // Container width
  containerMaxWidth: 'max-w-7xl',
  
  // Padding for responsive design
  containerPadding: 'px-3 sm:px-6 lg:px-8',
  
  // Section spacing (top and bottom)
  sectionPadding: {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-20',
  },
  
  // Page top padding (accounts for fixed header)
  pageTop: 'pt-16 sm:pt-20 md:pt-24',
  
  // Page bottom padding
  pageBottom: 'pb-12 sm:pb-16',
  
  // Minimum page height
  minHeight: 'min-h-screen',
  
  // Margins between sections
  sectionMargin: 'mb-8 sm:mb-12',
  
  // Grid gaps
  gridGap: {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  },
};

/**
 * Tailwind Classes for consistent page structure
 */
export const LAYOUT_CLASSES = {
  // Page wrapper - use this on all pages
  pageWrapper: `${LAYOUT.minHeight} bg-white`,
  
  // Main section with full width
  section: `w-full ${LAYOUT.containerPadding}`,
  
  // Section with background color and padding
  sectionWithBg: (bgColor = 'bg-white') => 
    `${bgColor} ${LAYOUT.containerPadding} ${LAYOUT.sectionPadding.md}`,
  
  // Container inside section
  container: `${LAYOUT.containerMaxWidth} mx-auto`,
  
  // Standard page header/hero
  pageHero: `${LAYOUT.pageTop} ${LAYOUT.pageBottom} ${LAYOUT.containerPadding} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900`,
  
  // Standard section container
  standardSection: `py-8 sm:py-12 ${LAYOUT.containerPadding}`,
  
  // Alternating background sections
  alternatingBg: (index: number) => index % 2 === 0 ? 'bg-white' : 'bg-slate-50',
};

/**
 * Helper function to get consistent container classes
 */
export function getContainerClasses(options?: {
  padding?: string;
  maxWidth?: string;
}): string {
  const padding = options?.padding || LAYOUT.containerPadding;
  const maxWidth = options?.maxWidth || LAYOUT.containerMaxWidth;
  return `w-full ${padding}`;
}

export function getInnerContainerClasses(options?: {
  maxWidth?: string;
}): string {
  const maxWidth = options?.maxWidth || LAYOUT.containerMaxWidth;
  return `${maxWidth} mx-auto`;
}
