"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useTheme, usePrimaryColor } from "@/contexts";

interface RetroButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: "yellow" | "pink" | "blue" | "green" | "purple" | "orange" | "white";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

// Light mode colors
const lightColors = {
  yellow: { bg: "#FFF3B0", hover: "#FFE566" },
  pink: { bg: "#FFD6E0", hover: "#FFB6C1" },
  blue: { bg: "#C5E8FF", hover: "#87CEEB" },
  green: { bg: "#D4F5D4", hover: "#90EE90" },
  purple: { bg: "#E8D5F2", hover: "#DDA0DD" },
  orange: { bg: "#FFE4C9", hover: "#FFD4A3" },
  white: { bg: "#FFFFFF", hover: "#F8F8F8" },
};

// Dark mode colors - More vibrant
const darkColors = {
  yellow: { bg: "#4A4530", hover: "#5A5540" },
  pink: { bg: "#4D3540", hover: "#5D4550" },
  blue: { bg: "#35404D", hover: "#45505D" },
  green: { bg: "#354D35", hover: "#455D45" },
  purple: { bg: "#453550", hover: "#554560" },
  orange: { bg: "#4D4035", hover: "#5D5045" },
  white: { bg: "#2A2A2A", hover: "#3A3A3A" },
};

const sizeVariants = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

export function RetroButton({ 
  children, 
  onClick, 
  color = "yellow",
  size = "md",
  disabled = false,
  className = "",
  type = "button"
}: RetroButtonProps) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const colors = isDark ? darkColors[color] : lightColors[color];
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : primaryColor;
  const shadowColor = isDark ? "rgba(0,0,0,0.3)" : primaryColor;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeVariants[size]}
        rounded-lg
        font-kanit font-medium
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${isDark ? "text-white" : "text-black"}
        ${className}
      `}
      style={{
        backgroundColor: colors.bg,
        border: `2px solid ${borderColor}`,
        boxShadow: `2px 2px 0px ${shadowColor}`,
      }}
      whileHover={!disabled ? { 
        x: -2, 
        y: -2,
        backgroundColor: colors.hover,
        boxShadow: `5px 5px 0px ${shadowColor}`
      } : {}}
      whileTap={!disabled ? { 
        x: 2, 
        y: 2,
        boxShadow: `1px 1px 0px ${shadowColor}`
      } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}
