"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts";

interface AnalogClockProps {
  size?: number;
  showNumbers?: boolean;
  showDigital?: boolean;
  className?: string;
}

export function AnalogClock({ 
  size = 200, 
  showNumbers = true, 
  showDigital = true,
  className = "" 
}: AnalogClockProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours + minutes / 60) / 12) * 360;

  // Theme colors
  const primaryColor = "#00568C";
  const bgColor = isDark ? "#1A1A1A" : "#FFFFFF";
  const borderColor = isDark ? "#00568C" : "#00568C";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const tickColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,86,140,0.3)";

  // Digital time format
  const formatTime = () => {
    return time.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = () => {
    const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${days[time.getDay()]} ${time.getDate()} ${months[time.getMonth()]}`;
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="relative rounded-full border-4"
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          borderColor: borderColor,
          boxShadow: isDark 
            ? "inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 20px rgba(0,86,140,0.3)" 
            : "inset 0 2px 10px rgba(0,0,0,0.1), 0 4px 20px rgba(0,86,140,0.2)",
        }}
      >
        {/* Clock face numbers/ticks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = Math.cos(angle) * (size / 2 - 25) + size / 2;
          const y = Math.sin(angle) * (size / 2 - 25) + size / 2;
          
          return showNumbers ? (
            <span
              key={i}
              className="absolute font-kanit font-bold text-sm"
              style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                color: primaryColor,
              }}
            >
              {i === 0 ? 12 : i}
            </span>
          ) : (
            <div
              key={i}
              className="absolute"
              style={{
                left: x,
                top: y,
                width: i % 3 === 0 ? 8 : 4,
                height: i % 3 === 0 ? 8 : 4,
                borderRadius: "50%",
                backgroundColor: i % 3 === 0 ? primaryColor : tickColor,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}

        {/* Hour hand */}
        <motion.div
          className="absolute origin-bottom rounded-full"
          style={{
            width: 6,
            height: size * 0.25,
            backgroundColor: primaryColor,
            left: "50%",
            bottom: "50%",
            marginLeft: -3,
            transformOrigin: "bottom center",
          }}
          animate={{ rotate: hourDegrees }}
          transition={{ type: "tween", duration: 0.5 }}
        />

        {/* Minute hand */}
        <motion.div
          className="absolute origin-bottom rounded-full"
          style={{
            width: 4,
            height: size * 0.35,
            backgroundColor: primaryColor,
            left: "50%",
            bottom: "50%",
            marginLeft: -2,
            transformOrigin: "bottom center",
          }}
          animate={{ rotate: minuteDegrees }}
          transition={{ type: "tween", duration: 0.5 }}
        />

        {/* Second hand */}
        <motion.div
          className="absolute origin-bottom"
          style={{
            width: 2,
            height: size * 0.4,
            backgroundColor: "#FF6B6B",
            left: "50%",
            bottom: "50%",
            marginLeft: -1,
            transformOrigin: "bottom center",
          }}
          animate={{ rotate: secondDegrees }}
          transition={{ type: "tween", duration: 0.1 }}
        />

        {/* Center dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: 12,
            height: 12,
            backgroundColor: primaryColor,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
          }}
        />
      </div>

      {/* Digital display */}
      {showDigital && (
        <div className="text-center">
          <p 
            className="font-mono text-2xl font-bold"
            style={{ color: primaryColor }}
          >
            {formatTime()}
          </p>
          <p 
            className="font-kanit text-xs"
            style={{ color: textColor }}
          >
            {formatDate()}
          </p>
        </div>
      )}
    </div>
  );
}

export default AnalogClock;
