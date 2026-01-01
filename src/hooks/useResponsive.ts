"use client";

import { useState, useEffect } from "react";

/**
 * ================================================
 * RESPONSIVE BREAKPOINT SYSTEM
 * ================================================
 * 
 * Breakpoints:
 * - Mobile:  < 640px  (default)
 * - Tablet:  640px - 1279px (increased for iPad Pro portrait)
 * - Desktop: >= 1280px (increased to avoid iPad Pro portrait issues)
 * 
 * Special Cases:
 * - iPad Pro Portrait (1024x1366): Treated as TABLET due to aspect ratio
 * - Any portrait device with width >= 1024px but height > width: TABLET
 * 
 * Tailwind Classes Reference:
 * - Mobile:  (no prefix) - base styles
 * - Tablet:  sm: (640px+), md: (768px+)
 * - Desktop: lg: (1024px+), xl: (1280px+), 2xl: (1536px+)
 * 
 * ================================================
 */

export type DeviceType = "mobile" | "tablet" | "desktop";
export type Orientation = "portrait" | "landscape";

interface UseResponsiveReturn {
  /** Current device type */
  device: DeviceType;
  /** True if mobile (<640px) */
  isMobile: boolean;
  /** True if tablet (640px - 1279px or portrait mode with width >= 1024px) */
  isTablet: boolean;
  /** True if desktop (>=1280px in landscape) */
  isDesktop: boolean;
  /** True if tablet or desktop (>=640px) */
  isTabletOrDesktop: boolean;
  /** True if mobile or tablet (<1280px or portrait) */
  isMobileOrTablet: boolean;
  /** Current viewport width */
  width: number;
  /** Current viewport height */
  height: number;
  /** Current orientation */
  orientation: Orientation;
  /** True if portrait mode */
  isPortrait: boolean;
  /** True if landscape mode */
  isLandscape: boolean;
  /** Aspect ratio (width / height) */
  aspectRatio: number;
  /** True if this looks like an iPad Pro in portrait */
  isLargeTabletPortrait: boolean;
}

const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1280, // Increased from 1024 to handle iPad Pro portrait
} as const;

/**
 * Hook for responsive design - detects device type based on viewport width AND orientation
 * 
 * Special handling for iPad Pro portrait mode (1024x1366):
 * - Even though width is >= 1024px, it's treated as tablet due to portrait orientation
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, isPortrait, device } = useResponsive();
 * 
 * // Conditional rendering
 * {isMobile && <MobileNav />}
 * {isTablet && <TabletNav />}
 * {isDesktop && <DesktopNav />}
 * 
 * // Handle iPad Pro portrait specifically
 * {isLargeTabletPortrait && <TabletPortraitLayout />}
 * ```
 */
export function useResponsive(): UseResponsiveReturn {
  const [state, setState] = useState<{
    device: DeviceType;
    width: number;
    height: number;
    orientation: Orientation;
    aspectRatio: number;
  }>({
    device: "desktop", // Default to desktop for SSR
    width: 1280,
    height: 800,
    orientation: "landscape",
    aspectRatio: 1.6,
  });

  useEffect(() => {
    /**
     * Determine device type based on width AND aspect ratio
     * iPad Pro portrait (1024x1366) should be treated as tablet
     */
    const getDevice = (width: number, height: number): DeviceType => {
      const isPortraitMode = height > width;
      const aspectRatio = width / height;
      
      // Mobile: width < 640px
      if (width < BREAKPOINTS.tablet) return "mobile";
      
      // Large tablet in portrait mode (like iPad Pro 1024x1366)
      // Even if width >= 1024, treat as tablet if in portrait
      if (width >= 1024 && width < BREAKPOINTS.desktop && isPortraitMode) {
        return "tablet";
      }
      
      // Portrait mode with width >= desktop breakpoint but aspect ratio < 1
      // This catches iPad Pro portrait at 1024px width
      if (isPortraitMode && aspectRatio < 0.8) {
        return "tablet";
      }
      
      // Tablet: 640px - 1279px
      if (width < BREAKPOINTS.desktop) return "tablet";
      
      // Desktop: >= 1280px in landscape
      return "desktop";
    };

    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation: Orientation = height > width ? "portrait" : "landscape";
      const aspectRatio = width / height;
      
      setState({
        device: getDevice(width, height),
        width,
        height,
        orientation,
        aspectRatio,
      });
    };

    // Initial update
    updateSize();

    // Listen for resize and orientation change
    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
    
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, []);

  // Check if this is a large tablet in portrait mode (like iPad Pro)
  const isLargeTabletPortrait = state.width >= 1024 && state.orientation === "portrait";

  return {
    device: state.device,
    isMobile: state.device === "mobile",
    isTablet: state.device === "tablet",
    isDesktop: state.device === "desktop",
    isTabletOrDesktop: state.device !== "mobile",
    isMobileOrTablet: state.device !== "desktop",
    width: state.width,
    height: state.height,
    orientation: state.orientation,
    isPortrait: state.orientation === "portrait",
    isLandscape: state.orientation === "landscape",
    aspectRatio: state.aspectRatio,
    isLargeTabletPortrait,
  };
}

/**
 * ================================================
 * RESPONSIVE UTILITY CLASSES (for Tailwind)
 * ================================================
 * 
 * Use these patterns in your components:
 * 
 * === LAYOUT ===
 * Grid columns:
 *   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
 * 
 * Flex direction:
 *   flex-col sm:flex-row
 * 
 * Container padding:
 *   p-4 sm:p-6 lg:p-8
 * 
 * === TYPOGRAPHY ===
 * Headings:
 *   text-xl sm:text-2xl lg:text-3xl
 * 
 * Body text:
 *   text-sm sm:text-base
 * 
 * === VISIBILITY ===
 * Mobile only:
 *   block sm:hidden
 * 
 * Tablet only:
 *   hidden sm:block lg:hidden
 * 
 * Desktop only:
 *   hidden lg:block
 * 
 * Mobile + Tablet:
 *   block lg:hidden
 * 
 * Tablet + Desktop:
 *   hidden sm:block
 * 
 * === SPACING ===
 * Gaps:
 *   gap-2 sm:gap-4 lg:gap-6
 * 
 * Margins:
 *   m-2 sm:m-4 lg:m-6
 * 
 * ================================================
 */

// Responsive class builder helper
export const responsive = {
  /**
   * Create responsive class string
   * @example responsive.classes("p-2", "p-4", "p-6") => "p-2 sm:p-4 lg:p-6"
   */
  classes: (mobile: string, tablet: string, desktop: string): string => {
    return `${mobile} sm:${tablet} lg:${desktop}`;
  },

  /**
   * Grid columns responsive helper
   * @example responsive.gridCols(1, 2, 3) => "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
   */
  gridCols: (mobile: number, tablet: number, desktop: number): string => {
    return `grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop}`;
  },

  /**
   * Text size responsive helper
   * @example responsive.text("sm", "base", "lg") => "text-sm sm:text-base lg:text-lg"
   */
  text: (mobile: string, tablet: string, desktop: string): string => {
    return `text-${mobile} sm:text-${tablet} lg:text-${desktop}`;
  },

  /**
   * Padding responsive helper
   * @example responsive.padding(2, 4, 6) => "p-2 sm:p-4 lg:p-6"
   */
  padding: (mobile: number, tablet: number, desktop: number): string => {
    return `p-${mobile} sm:p-${tablet} lg:p-${desktop}`;
  },

  /**
   * Gap responsive helper
   * @example responsive.gap(2, 4, 6) => "gap-2 sm:gap-4 lg:gap-6"
   */
  gap: (mobile: number, tablet: number, desktop: number): string => {
    return `gap-${mobile} sm:gap-${tablet} lg:gap-${desktop}`;
  },
};

export default useResponsive;
