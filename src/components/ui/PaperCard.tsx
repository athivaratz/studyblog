"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useTheme, usePrimaryColor } from "@/contexts";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  rotate?: number;
  color?: "white" | "cream" | "yellow" | "pink" | "blue" | "green" | "purple";
  onClick?: () => void;
}

// Light mode colors
const lightColors = {
  white: "#FFFEF9",
  cream: "#F5F5F5",
  yellow: "#FFF3B0",
  pink: "#FFD6E0",
  blue: "#C5E8FF",
  green: "#D4F5D4",
  purple: "#E8D5F2",
};

// Dark mode colors - More vibrant
const darkColors = {
  white: "#2A2A2A",
  cream: "#302D28",
  yellow: "#4A4530",
  pink: "#4D3540",
  blue: "#35404D",
  green: "#354D35",
  purple: "#453550",
};

export function PaperCard({ 
  children, 
  className = "", 
  rotate = 0,
  color = "white",
  onClick
}: PaperCardProps) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const bgColor = isDark ? darkColors[color] : lightColors[color];
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : primaryColor;
  const shadowColor = isDark ? "rgba(0,0,0,0.3)" : primaryColor;
  const textureClass = isDark ? "paper-texture-dark" : "paper-texture";

  return (
    <motion.div
      onClick={onClick}
      className={`
        rounded-xl p-4 lg:p-6
        ${textureClass}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: `4px 4px 0px ${shadowColor}`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, rotate }}
      whileHover={onClick ? { 
        scale: 1.02, 
        rotate: rotate * 0.5,
        boxShadow: `6px 6px 0px ${shadowColor}`
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
