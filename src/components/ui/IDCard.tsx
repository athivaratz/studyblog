"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

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
  school = "Studygram Academy",
  avatar,
  photoURL,
  className = ""
}: IDCardProps) {
  const displayPhoto = photoURL || avatar;
  
  return (
    <motion.div
      className={`
        id-card dark:bg-[#2D2D2D] dark:border-white/20
        w-[300px] h-auto min-h-[200px]
        p-4 pb-10 relative overflow-hidden
        ${className}
      `}
      initial={{ opacity: 0, rotateY: -30 }}
      animate={{ opacity: 1, rotateY: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "6px 6px 0px #1A1A1A"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Header stripe */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-[#FFD6E0] via-[#C5E8FF] to-[#E8D5F2] dark:from-[#5C3A42] dark:via-[#2A3A4D] dark:to-[#3D2A4D] border-b-2 border-black dark:border-white/20" />
      
      {/* School name */}
      <div className="relative z-10 mt-2 mb-3">
        <h3 className="font-felipa text-lg text-center text-black/80 dark:text-white/80">{school}</h3>
      </div>
      
      <div className="flex gap-4 mt-2">
        {/* Avatar */}
        <div className="w-20 h-24 bg-[#F5E6D3] dark:bg-[#3D3A2A] border-2 border-black dark:border-white/20 rounded-lg flex items-center justify-center overflow-hidden">
          {displayPhoto ? (
            <img src={displayPhoto} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-10 h-10 text-black/40 dark:text-white/40" />
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 space-y-1 min-w-0">
          <p className="font-kanit font-semibold text-base truncate dark:text-white">{name}</p>
          <div className="space-y-0.5">
            <p className="text-xs text-black/60 dark:text-white/60 font-kanit">รหัสนักเรียน</p>
            <p className="font-mono text-sm font-bold tracking-wider dark:text-white">{studentId}</p>
          </div>
        </div>
      </div>
      
      {/* Barcode effect */}
      <div className="absolute bottom-3 left-4 right-4 h-6 flex gap-[2px]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-black dark:bg-white h-full" 
            style={{ width: (i * 7) % 3 === 0 ? 2 : 1 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
