"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  rotate?: number;
  color?: "white" | "cream" | "yellow" | "pink" | "blue" | "green" | "purple";
  onClick?: () => void;
}

const bgColors = {
  white: "bg-[#FFFEF9] dark:bg-[#2D2D2D]",
  cream: "bg-[#FFF8E7] dark:bg-[#333333]",
  yellow: "bg-[#FFF3B0] dark:bg-[#4D4A2A]",
  pink: "bg-[#FFD6E0] dark:bg-[#5C3A42]",
  blue: "bg-[#C5E8FF] dark:bg-[#2A3A4D]",
  green: "bg-[#D4F5D4] dark:bg-[#2A4D2A]",
  purple: "bg-[#E8D5F2] dark:bg-[#3D2A4D]",
};

export function PaperCard({ 
  children, 
  className = "", 
  rotate = 0,
  color = "white",
  onClick
}: PaperCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`
        ${bgColors[color]}
        border-2 border-black dark:border-white/20 rounded-xl
        shadow-hard dark:shadow-none p-4 lg:p-6
        paper-texture dark:paper-texture-dark
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, rotate }}
      whileHover={onClick ? { 
        scale: 1.02, 
        rotate: rotate * 0.5,
        boxShadow: "6px 6px 0px #1A1A1A"
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
