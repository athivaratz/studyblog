"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface FolderTabProps {
  label: string;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

const lightColors: Record<string, string> = {
  yellow: "#FFF3B0",
  pink: "#FFD6E0",
  blue: "#C5E8FF",
  green: "#D4F5D4",
  purple: "#E8D5F2",
  orange: "#FFE4C9",
};

const darkColors: Record<string, string> = {
  yellow: "#4D4A2A",
  pink: "#5C3A42",
  blue: "#2A3A4D",
  green: "#2A4D2A",
  purple: "#3D2A4D",
  orange: "#4D3A2A",
};

export function FolderTab({ 
  label, 
  color, 
  isActive = false, 
  onClick,
  icon 
}: FolderTabProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const bgColor = isDark ? (darkColors[color] || darkColors.yellow) : (lightColors[color] || lightColors.yellow);
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#000000";
  const textColor = isDark ? "#FFFFFF" : "#000000";

  return (
    <motion.button
      onClick={onClick}
      className="relative px-3 py-2 lg:px-6 lg:py-3 rounded-t-xl border-2 border-b-0 font-kanit font-medium text-xs lg:text-sm transition-colors cursor-pointer"
      style={{ 
        backgroundColor: bgColor, 
        borderColor, 
        color: textColor,
        zIndex: isActive ? 10 : 0
      }}
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
        className="absolute -bottom-[2px] left-0 right-0 h-[4px]"
        style={{ 
          backgroundColor: bgColor,
          opacity: isActive ? 1 : 0
        }}
      />
    </motion.button>
  );
}
