"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RetroButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: "yellow" | "pink" | "blue" | "green" | "purple" | "orange" | "white";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const colorVariants = {
  yellow: "bg-[#FFF3B0] hover:bg-[#FFE566] dark:bg-[#4D4A2A] dark:hover:bg-[#5D5A3A]",
  pink: "bg-[#FFD6E0] hover:bg-[#FFB6C1] dark:bg-[#5C3A42] dark:hover:bg-[#6C4A52]",
  blue: "bg-[#C5E8FF] hover:bg-[#87CEEB] dark:bg-[#2A3A4D] dark:hover:bg-[#3A4A5D]",
  green: "bg-[#D4F5D4] hover:bg-[#90EE90] dark:bg-[#2A4D2A] dark:hover:bg-[#3A5D3A]",
  purple: "bg-[#E8D5F2] hover:bg-[#DDA0DD] dark:bg-[#3D2A4D] dark:hover:bg-[#4D3A5D]",
  orange: "bg-[#FFE4C9] hover:bg-[#FFD4A3] dark:bg-[#4D3A2A] dark:hover:bg-[#5D4A3A]",
  white: "bg-white hover:bg-gray-50 dark:bg-[#2D2D2D] dark:hover:bg-[#3D3D3D]",
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
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colorVariants[color]}
        ${sizeVariants[size]}
        border-2 border-black dark:border-white/20 rounded-lg
        font-kanit font-medium dark:text-white
        shadow-hard-sm dark:shadow-none
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${className}
      `}
      whileHover={!disabled ? { 
        x: -2, 
        y: -2,
        boxShadow: "5px 5px 0px #1A1A1A"
      } : {}}
      whileTap={!disabled ? { 
        x: 2, 
        y: 2,
        boxShadow: "1px 1px 0px #1A1A1A"
      } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}
