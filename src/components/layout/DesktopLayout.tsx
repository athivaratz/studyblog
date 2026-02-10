"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";

/**
 * ================================================
 * RESPONSIVE LAYOUT COMPONENT
 * ================================================
 * 
 * Breakpoints (Updated for iPad Pro portrait fix):
 * - Mobile:  < 640px  → No sidebar, minimal padding
 * - Tablet:  640px - 1279px → No sidebar, medium padding
 * - Desktop: >= 1280px (xl:) → With sidebar, full padding
 * 
 * Special: iPad Pro Portrait (1024x1366) treated as Tablet
 * 
 * ================================================
 */

interface DesktopLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function DesktopLayout({ children, sidebar }: DesktopLayoutProps) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  const bgColor = isDark ? "#1A1A1A" : "#F5F5F5";
  const gridOpacity = isDark ? 0.05 : 0.03;
  const decorOpacity = isDark ? 0.6 : 1;
  const corkGradient = isDark 
    ? "linear-gradient(to bottom, rgba(181, 101, 29, 0.1), transparent)"
    : "linear-gradient(to bottom, rgba(181, 101, 29, 0.2), transparent)";

  const lightGradient = `
    radial-gradient(circle at 20% 80%, rgba(197,232,255,0.3) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(197,232,255,0.2) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(232,213,242,0.15) 0%, transparent 60%),
    linear-gradient(135deg, #ECECEC 0%, #F5F5F5 50%, #ECECEC 100%)
  `;

  const darkGradient = `
    radial-gradient(circle at 20% 80%, rgba(255,107,107,0.1) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(107,166,255,0.1) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(168,107,255,0.05) 0%, transparent 60%),
    linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)
  `;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark ? darkGradient : lightGradient
        }}
      />

      {/* Decorative grid pattern */}
      <div 
        className="absolute inset-0"
        style={{
          opacity: gridOpacity,
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Cork board texture on edges */}
      <div 
        className="absolute top-0 left-0 right-0 h-3"
        style={{ background: corkGradient }}
      />
      
      <div className="relative z-10 flex min-h-screen">
        {/* 
          ================================================
          SIDEBAR - DESKTOP ONLY (>= 1280px / xl:)
          Hidden on iPad Pro portrait (1024px width)
          ================================================
        */}
        {sidebar && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="
              w-80 p-4 
              hidden xl:block
            "
          >
            {sidebar}
          </motion.aside>
        )}

        {/* 
          ================================================
          MAIN CONTENT - RESPONSIVE PADDING
          ================================================
          Mobile:  p-4 pt-2
          Tablet:  p-6 (sm:p-6)
          Desktop: p-8 pt-4 (xl:p-8 xl:pt-4)
        */}
        <main className="
          flex-1 
          p-4 pt-2
          sm:p-6
          xl:p-8 xl:pt-4
        ">
          {children}
        </main>
      </div>

      {/* 
        ================================================
        DECORATIVE ELEMENTS - RESPONSIVE VISIBILITY
        ================================================
      */}
      
      {/* Always visible */}
      <motion.div
        className="absolute bottom-4 right-4 text-4xl select-none pointer-events-none"
        style={{ opacity: decorOpacity }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        ⭐
      </motion.div>
      

    </div>
  );
}
