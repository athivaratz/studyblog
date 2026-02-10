"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";

interface IDCardProps {
  name: string;
  studentId?: string;
  school?: string;
  avatar?: string;
  photoURL?: string;
  className?: string;
}

export function IDCard({ 
  name, 
  studentId = "000000",
  school = "studyblog Academy",
  avatar,
  photoURL,
  className = ""
}: IDCardProps) {
  const displayPhoto = photoURL || avatar;
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  // Theme colors
  const cardBg = isDark ? "#2D2D2D" : undefined;
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : primaryColor;
  const headerGradient = isDark 
    ? "linear-gradient(to right, #5C3A42, #2A3A4D, #3D2A4D)"
    : "linear-gradient(to right, #FFD6E0, #C5E8FF, #E8D5F2)";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const schoolText = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)";
  const avatarBg = isDark ? "#3D3A2A" : "#EBEBEB";
  const iconColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const barcodeColor = isDark ? "#FFFFFF" : "#000000";
  
  return (
    <motion.div
      className={`id-card w-[300px] h-auto min-h-[200px] p-4 pb-10 relative overflow-hidden ${className}`}
      style={{ 
        backgroundColor: cardBg, 
        borderColor 
      }}
      initial={{ opacity: 0, rotateY: -30 }}
      animate={{ opacity: 1, rotateY: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: `6px 6px 0px ${primaryColor}`
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Header stripe */}
      <div 
        className="absolute top-0 left-0 right-0 h-8 border-b-2"
        style={{ background: headerGradient, borderColor }}
      />
      
      {/* School name */}
      <div className="relative z-10 mt-2 mb-3">
        <h3 className="font-felipa text-lg text-center" style={{ color: schoolText }}>{school}</h3>
      </div>
      
      <div className="flex gap-4 mt-2">
        {/* Avatar */}
        <div 
          className="w-20 h-24 border-2 rounded-lg flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: avatarBg, borderColor }}
        >
          {displayPhoto ? (
            <img src={displayPhoto} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-10 h-10" style={{ color: iconColor }} />
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 space-y-1 min-w-0">
          <p className="font-kanit font-semibold text-base truncate" style={{ color: textColor }}>{name}</p>
          <div className="space-y-0.5">
            <p className="text-xs font-kanit" style={{ color: textMuted }}>รหัสนักเรียน</p>
            <p className="font-mono text-sm font-bold tracking-wider" style={{ color: textColor }}>{studentId}</p>
          </div>
        </div>
      </div>
      
      {/* Barcode effect */}
      <div className="absolute bottom-3 left-4 right-4 h-6 flex gap-[2px]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="h-full" 
            style={{ 
              backgroundColor: barcodeColor,
              width: (i * 7) % 3 === 0 ? 2 : 1 
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
