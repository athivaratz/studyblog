"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DesktopLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function DesktopLayout({ children, sidebar }: DesktopLayoutProps) {
  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-[#FFF8E7] dark:bg-[#1A1A1A]"
    >
      {/* Light mode gradient background */}
      <div 
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(255,211,224,0.3) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(197,232,255,0.3) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(232,213,242,0.2) 0%, transparent 60%),
            linear-gradient(135deg, #F5E6D3 0%, #FFF8E7 50%, #F5E6D3 100%)
          `
        }}
      />
      
      {/* Dark mode gradient background */}
      <div 
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(255,107,107,0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(107,166,255,0.1) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(168,107,255,0.05) 0%, transparent 60%),
            linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)
          `
        }}
      />

      {/* Decorative grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Cork board texture on edges */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-[#B5651D]/20 dark:from-[#B5651D]/10 to-transparent" />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar - Hidden on mobile */}
        {sidebar && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 p-4 hidden lg:block"
          >
            {sidebar}
          </motion.aside>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 lg:pt-4 pt-2">
          {children}
        </main>
      </div>

      {/* Decorative stickers */}
      <motion.div
        className="absolute bottom-4 right-4 text-4xl select-none pointer-events-none dark:opacity-60"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        ⭐
      </motion.div>
      
      <motion.div
        className="absolute top-20 right-8 text-3xl select-none pointer-events-none hidden md:block dark:opacity-60"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🌸
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-8 text-3xl select-none pointer-events-none hidden lg:block dark:opacity-60"
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        📚
      </motion.div>
    </div>
  );
}
