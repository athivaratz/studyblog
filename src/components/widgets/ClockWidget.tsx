"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ClockWidgetProps {
  className?: string;
}

export function ClockWidget({ className = "" }: ClockWidgetProps) {
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

  return (
    <motion.div
      className={`
        bg-[#1A1A1A] border-3 border-black rounded-2xl
        p-5 w-[200px]
        shadow-hard
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Digital display */}
      <div className="bg-[#0D2818] border-2 border-black rounded-lg p-3 mb-3">
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
