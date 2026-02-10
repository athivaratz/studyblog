"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useTheme, usePrimaryColor } from "@/contexts";

interface StickyNoteProps {
  children: ReactNode;
  color?: "yellow" | "pink" | "blue" | "green" | "purple" | "orange";
  rotate?: number;
  className?: string;
}

// Light mode colors
const lightColors = {
  yellow: "#FFF3B0",
  pink: "#FFD6E0",
  blue: "#C5E8FF",
  green: "#D4F5D4",
  purple: "#E8D5F2",
  orange: "#FFE4C9",
};

// Dark mode colors - More saturated
const darkColors = {
  yellow: "#4A4530",
  pink: "#4D3540",
  blue: "#35404D",
  green: "#354D35",
  purple: "#453550",
  orange: "#4D4035",
};

export function StickyNote({ 
  children, 
  color = "yellow",
  rotate = -2,
  className = ""
}: StickyNoteProps) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const bgColor = isDark ? darkColors[color] : lightColors[color];
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : primaryColor;
  const shadowColor = isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)";
  const tapeColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)";
  const tapeBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.2)";

  return (
    <motion.div
      className={`
        p-4 min-w-[180px]
        font-kanit relative
        ${isDark ? "text-white" : "text-black"}
        ${className}
      `}
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: `4px 4px 8px ${shadowColor}`,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: rotate - 5 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0,
        boxShadow: `6px 6px 12px ${shadowColor}`
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Tape effect on top */}
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-sm"
        style={{
          backgroundColor: tapeColor,
          border: `1px solid ${tapeBorder}`,
        }}
      />
      
      {children}
    </motion.div>
  );
}
