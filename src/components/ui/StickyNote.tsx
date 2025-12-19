"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StickyNoteProps {
  children: ReactNode;
  color?: "yellow" | "pink" | "blue" | "green" | "purple" | "orange";
  rotate?: number;
  className?: string;
}

const colorVariants = {
  yellow: "bg-[#FFF3B0]",
  pink: "bg-[#FFD6E0]",
  blue: "bg-[#C5E8FF]",
  green: "bg-[#D4F5D4]",
  purple: "bg-[#E8D5F2]",
  orange: "bg-[#FFE4C9]",
};

export function StickyNote({ 
  children, 
  color = "yellow",
  rotate = -2,
  className = ""
}: StickyNoteProps) {
  return (
    <motion.div
      className={`
        ${colorVariants[color]}
        border-2 border-black
        p-4 min-w-[180px]
        font-kanit
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.8, rotate: rotate - 5 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0,
        boxShadow: "6px 6px 12px rgba(0,0,0,0.2)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        boxShadow: "4px 4px 8px rgba(0,0,0,0.15)"
      }}
    >
      {/* Tape effect on top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/60 border border-black/20 rounded-sm" />
      
      {children}
    </motion.div>
  );
}
