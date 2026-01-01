"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts";

interface ClockWidgetProps {
  className?: string;
}

export function ClockWidget({ className = "" }: ClockWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  // Theme-aware colors
  const bgColor = isDark ? "#1A1A1A" : "#2D2D2D";
  const borderColor = isDark ? "#606060" : "#1A1A1A";
  const shadowColor = isDark ? "#404040" : "#1A1A1A";
  const screenBg = isDark ? "#0D2818" : "#0A1F14";

  return (
    <motion.div
      className={`rounded-2xl p-5 w-[200px] ${className}`}
      style={{
        backgroundColor: bgColor,
        border: `3px solid ${borderColor}`,
        boxShadow: `4px 4px 0px ${shadowColor}`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Digital display */}
      <div 
        className="rounded-lg p-3 mb-3"
        style={{
          backgroundColor: screenBg,
          border: `2px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center justify-center gap-1">
          <span className="font-mono text-3xl text-[#39FF14] font-bold tracking-wider">
            {hours}
          </span>
          <motion.span 
            className="font-mono text-3xl text-[#39FF14] font-bold"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            :
          </motion.span>
          <span className="font-mono text-3xl text-[#39FF14] font-bold tracking-wider">
            {minutes}
          </span>
        </div>
        <p className="text-center font-mono text-xs text-[#39FF14]/60 mt-1">
          :{seconds}
        </p>
      </div>
      
      {/* Date display */}
      <div className="text-center">
        <p className="font-kanit text-sm text-white/80">
          วัน{dayNames[time.getDay()]}
        </p>
        <p className="font-kanit text-xs text-white/50">
          {time.getDate()} {monthNames[time.getMonth()]} {time.getFullYear() + 543}
        </p>
      </div>
    </motion.div>
  );
}
