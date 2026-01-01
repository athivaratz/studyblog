"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts";
import { ReactNode } from "react";

interface FolderCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function FolderCard({ 
  title, 
  children, 
  className = "",
  headerAction 
}: FolderCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const primaryColor = "#00568C";
  const bgColor = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";

  // Striped pattern for header
  const stripePattern = `repeating-linear-gradient(
    -45deg,
    ${primaryColor},
    ${primaryColor} 10px,
    ${isDark ? "#004570" : "#0070B0"} 10px,
    ${isDark ? "#004570" : "#0070B0"} 20px
  )`;

  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Folder tab (top-left ear) */}
      <div 
        className="absolute -top-px -left-px"
        style={{
          width: 120,
          height: 28,
          background: stripePattern,
          borderRadius: "0 0 12px 0",
          borderRight: `2px solid ${borderColor}`,
          borderBottom: `2px dashed ${borderColor}`,
        }}
      />

      {/* Header stripe bar */}
      <div 
        className="pt-6"
        style={{
          background: stripePattern,
          padding: "32px 16px 12px 16px",
        }}
      >
        <div className="flex items-center justify-between">
          {title && (
            <h3 
              className="font-felipa text-xl text-white"
              style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
            >
              {title}
            </h3>
          )}
          {headerAction}
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {children}
      </div>

      {/* Bottom stripe bar */}
      <div 
        style={{
          background: stripePattern,
          height: 12,
        }}
      />
    </motion.div>
  );
}

export default FolderCard;
