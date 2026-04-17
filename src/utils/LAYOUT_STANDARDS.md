/**
 * WONDER Travelers Layout & Spacing Standards
 * 
 * This file documents all standardized layout values for consistent
 * margin, width, padding, and spacing across the entire website.
 * 
 * Last Updated: March 13, 2026
 */

// ============================================================================
// CONTAINER WIDTHS - Used across all pages
// ============================================================================

export const CONTAINER_WIDTHS = {
  // Main content container (all pages)
  maxWidth: 'max-w-7xl',        // 1280px max
  alignment: 'mx-auto',          // Center aligned
};

// ============================================================================
// RESPONSIVE PADDING - Applied to all containers
// ============================================================================

export const RESPONSIVE_PADDING = {
  horizontal: 'px-3 sm:px-6 lg:px-8',
  
  // Breakdown:
  // px-3    : 12px padding on mobile (< 640px)
  // sm:px-6 : 24px padding on tablets (640px - 1024px)
  // lg:px-8 : 32px padding on desktop (> 1024px)
};

// ============================================================================
// SECTION SPACING (Vertical)
// ============================================================================

export const SECTION_PADDING = {
  compact: 'py-6 sm:py-8',           // 24px/32px - Small sections
  standard: 'py-8 sm:py-12',         // 32px/48px - Default sections
  large: 'py-12 sm:py-16',           // 48px/64px - Large sections
  hero: 'pt-16 sm:pt-20 md:pt-24',   // Page hero sections
};

// ============================================================================
// COMPONENT SPACING PATTERNS
// ============================================================================

export const COMPONENT_SPACING = {
  // Header elements
  headerPadding: 'py-2.5',           // Compact vertical padding (when scrolled)
  headerPaddingDefault: 'py-3',      // Default header padding
  
  // Footer elements
  footerMainPadding: 'py-12 lg:py-16',  // Footer content
  footerBottomPadding: 'py-6',          // Footer bottom bar
  
  // Section dividers
  sectionMargin: 'mb-8 sm:mb-12',    // Space between sections
};

// ============================================================================
// GRID & LAYOUT PATTERNS
// ============================================================================

export const GRID_SPACING = {
  gap: {
    compact: 'gap-4',               // 16px gap
    standard: 'gap-6 md:gap-8',    // 24px/32px gap
    large: 'gap-8 md:gap-12',      // 32px/48px gap
  },
  
  columns: {
    twoCol: 'grid-cols-1 md:grid-cols-2',
    threeCol: 'grid-cols-1 md:grid-cols-3',
    threeColLarge: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  },
};

// ============================================================================
// ACTUAL COMPONENT IMPLEMENTATIONS
// ============================================================================

/**
 * HEADER (TopinfoBar + Header)
 * 
 * TopinfoBar
 * - Width:    max-w-7xl mx-auto
 * - Padding:  px-3 sm:px-6 lg:px-8
 * - Vertical: py-2 | py-2.5 (when scrolled)
 * 
 * Header
 * - Width:    max-w-7xl mx-auto
 * - Padding:  px-3 sm:px-6 lg:px-8
 * - Vertical: py-3 (default) | py-2.5 (scrolled)
 * 
 * Usage:
 * <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
 *   {/* Content */}
 * </div>
 */

/**
 * PAGE SECTIONS
 * 
 * Hero Sections:
 * - Width:    max-w-7xl mx-auto
 * - Padding:  px-3 sm:px-6 lg:px-8 (horizontal)
 *            pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 (vertical)
 * - BG:       bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
 * 
 * Content Sections:
 * - Width:    max-w-7xl mx-auto
 * - Padding:  px-3 sm:px-6 lg:px-8 (horizontal)
 *            py-8 sm:py-12 (vertical)
 * - BG:       Alternate: white & slate-50
 * 
 * Usage:
 * <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 bg-white">
 *   <div className="max-w-7xl mx-auto">
 *     {/* Content */}
 *   </div>
 * </section>
 */

/**
 * PAGE LAYOUT STRUCTURE
 * 
 * <PageWrapper bgColor="white">
 *   <PageHero title="..." />                  ← pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16
 *   <PageSection bgColor="slate-50">         ← py-8 sm:py-12
 *     <SectionHeader title="..." />           ← mb-8 sm:mb-12
 *     <GridContainer cols={2} gap="md">      ← gap-6 md:gap-8
 *       {/* Content items */}
 *     </GridContainer>
 *   </PageSection>
 *   <PageSection bgColor="white" padding="lg"> ← py-12 sm:py-16
 *     {/* More content */}
 *   </PageSection>
 * </PageWrapper>
 */

/**
 * FOOTER
 * 
 * - Width:    max-w-7xl mx-auto
 * - Padding:  px-3 sm:px-6 lg:px-8 (horizontal)
 *            py-12 lg:py-16 (main content)
 *            py-6 (bottom bar)
 * - BG:       bg-white border-t border-slate-200/50
 * 
 * Usage:
 * <footer className="w-full bg-white border-t border-slate-200/50">
 *   <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
 *     {/* Footer content */}
 *   </div>
 * </footer>
 */

// ============================================================================
// MARGIN RULES
// ============================================================================

/**
 * MARGIN CONSISTENCY
 * 
 * Between sections:      mb-8 sm:mb-12 (32px/48px)
 * Between header items:  gap-3 (12px) for inline elements
 * Between columns:       gap-6 md:gap-8 (24px/32px)
 * 
 * NO margins on top-level containers
 * Use padding on container instead
 */

// ============================================================================
// RESPONSIVE BREAKPOINTS USED
// ============================================================================

/**
 * Tailwind Breakpoints:
 * - sm: 640px   (tablets)
 * - md: 768px   (small desktops)
 * - lg: 1024px  (large desktops)
 * - xl: 1280px  (extra large)
 * 
 * Our primary breakpoints:
 * - Mobile-first default
 * - sm:  For tablets (640px+)
 * - md:  For grid layouts (768px+)
 * - lg:  For large screen padding (1024px+)
 */

// ============================================================================
// VERIFICATION CHECKLIST
// ============================================================================

/**
 * Use this checklist when adding new pages/sections:
 * 
 * ✓ Container: max-w-7xl mx-auto
 * ✓ Padding: px-3 sm:px-6 lg:px-8
 * ✓ Section vertical: py-8 sm:py-12 (or py-12 sm:py-16 for large)
 * ✓ Hero vertical: pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16
 * ✓ Grid gaps: gap-6 md:gap-8
 * ✓ Section dividers: mb-8 sm:mb-12
 * ✓ Alternating backgrounds: white & slate-50
 * ✓ Hero backgrounds: gradient-to-b from-slate-900 via-slate-800 to-slate-900
 */

export default {
  CONTAINER_WIDTHS,
  RESPONSIVE_PADDING,
  SECTION_PADDING,
  COMPONENT_SPACING,
  GRID_SPACING,
};
