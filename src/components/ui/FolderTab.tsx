"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FolderTabProps {
  label: string;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

const colorVariants: Record<string, string> = {
  yellow: "bg-[#FFF3B0] dark:bg-[#4D4A2A]",
  pink: "bg-[#FFD6E0] dark:bg-[#5C3A42]",
  blue: "bg-[#C5E8FF] dark:bg-[#2A3A4D]",
  green: "bg-[#D4F5D4] dark:bg-[#2A4D2A]",
  purple: "bg-[#E8D5F2] dark:bg-[#3D2A4D]",
  orange: "bg-[#FFE4C9] dark:bg-[#4D3A2A]",
};

export function FolderTab({ 
  label, 
  color, 
  isActive = false, 
  onClick,
  icon 
}: FolderTabProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative px-3 py-2 lg:px-6 lg:py-3 rounded-t-xl
        border-2 border-black dark:border-white/20 border-b-0
        font-kanit font-medium text-xs lg:text-sm
        transition-colors cursor-pointer dark:text-white
        ${colorVariants[color] || colorVariants.yellow}
        ${isActive ? "z-10" : "z-0"}
      `}
      initial={false}
      animate={{
        y: isActive ? -6 : 0,
        scale: isActive ? 1.02 : 1,
      }}
      whileHover={{ y: isActive ? -6 : -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className="flex items-center gap-1 lg:gap-2">
        {icon && <span className="text-sm lg:text-lg">{icon}</span>}
        <span className="hidden sm:inline">{label}</span>
      </span>
      
      {/* Tab shadow effect */}
      <div 
        className={`
          absolute -bottom-[2px] left-0 right-0 h-[4px]
          ${colorVariants[color] || colorVariants.yellow}
          ${isActive ? "opacity-100" : "opacity-0"}
        `}
      />
    </motion.button>
  );
}
