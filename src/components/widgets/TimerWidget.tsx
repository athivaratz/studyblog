"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";
import { useTheme, usePrimaryColor } from "@/contexts";

interface TimerWidgetProps {
  className?: string;
  onSwap?: () => void;
}

type TimerMode = "pomodoro" | "stopwatch";

export function TimerWidget({ className = "", onSwap }: TimerWidgetProps) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes default for pomodoro
  const [laps, setLaps] = useState<number[]>([]);
  
  // Pomodoro presets
  const pomodoroPresets = [
    { label: "25 นาที", time: 25 * 60 },
    { label: "45 นาที", time: 45 * 60 },
    { label: "60 นาที", time: 60 * 60 },
  ];
  const [selectedPreset, setSelectedPreset] = useState(0);

  // Theme-aware colors
  const bgColor = isDark ? "#1A1A1A" : "#2D2D2D";
  const borderColor = isDark ? "#606060" : primaryColor;
  const shadowColor = isDark ? "#404040" : primaryColor;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === "pomodoro") {
          setTime((prev) => {
            if (prev <= 0) {
              setIsRunning(false);
              // Play notification sound or vibrate
              return 0;
            }
            return prev - 1;
          });
        } else {
          // Stopwatch counts up
          setTime((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleReset = () => {
    setIsRunning(false);
    if (mode === "pomodoro") {
      setTime(pomodoroPresets[selectedPreset].time);
    } else {
      setTime(0);
      setLaps([]);
    }
  };

  const handleLap = () => {
    if (mode === "stopwatch" && isRunning) {
      setLaps((prev) => [...prev, time]);
    }
  };

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setTime(pomodoroPresets[index].time);
    setIsRunning(false);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setLaps([]);
    if (newMode === "pomodoro") {
      setTime(pomodoroPresets[selectedPreset].time);
    } else {
      setTime(0);
    }
  };

  // Calculate progress for pomodoro
  const progress = mode === "pomodoro" 
    ? ((pomodoroPresets[selectedPreset].time - time) / pomodoroPresets[selectedPreset].time) * 100
    : 0;

  return (
    <motion.div
      className={`rounded-2xl p-4 w-[200px] ${className}`}
      style={{
        backgroundColor: bgColor,
        border: `3px solid ${borderColor}`,
        boxShadow: `4px 4px 0px ${shadowColor}`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1">
          <button
            onClick={() => handleModeChange("pomodoro")}
            className={`
              px-2 py-1 rounded-md text-xs font-kanit
              transition-colors
              ${mode === "pomodoro" 
                ? "text-white" 
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }
            `}
            style={mode === "pomodoro" ? { backgroundColor: primaryColor } : undefined}
          >
            🍅
          </button>
          <button
            onClick={() => handleModeChange("stopwatch")}
            className={`
              px-2 py-1 rounded-md text-xs font-kanit
              transition-colors
              ${mode === "stopwatch" 
                ? "bg-[#4ECDC4] text-white" 
                : "bg-white/10 text-white/60 hover:bg-white/20"
              }
            `}
          >
            ⏱️
          </button>
        </div>
        
        {/* Swap button */}
        {onSwap && (
          <motion.button
            onClick={onSwap}
            className="text-white/40 hover:text-white/80 transition-colors"
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Timer Display */}
      <div className="relative mb-3">
        {/* Progress ring for pomodoro */}
        {mode === "pomodoro" && (
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 60">
            <rect
              x="5"
              y="5"
              width="90"
              height="50"
              rx="8"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            <rect
              x="5"
              y="5"
              width="90"
              height="50"
              rx="8"
              fill="none"
              stroke={primaryColor}
              strokeWidth="2"
              strokeDasharray={`${progress * 2.8} 280`}
              className="transition-all duration-1000"
            />
          </svg>
        )}
        
        <div 
          className="rounded-lg p-3"
          style={{
            backgroundColor: mode === "pomodoro" ? "#2A1515" : "#152A28",
            border: `2px solid ${borderColor}`,
          }}
        >
          <div className="flex items-center justify-center">
            <motion.span 
              className="font-mono text-3xl font-bold tracking-wider"
              style={{ color: mode === "pomodoro" ? primaryColor : "#4ECDC4" }}
              key={time}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              {formatTime(time)}
            </motion.span>
          </div>
          <p className="text-center font-kanit text-xs mt-1"
            style={{ color: mode === "pomodoro" ? `${primaryColor}99` : "rgba(78,205,196,0.6)" }}
          >
            {mode === "pomodoro" ? "โหมดโพโมโดโร" : "นาฬิกาจับเวลา"}
          </p>
        </div>
      </div>

      {/* Preset buttons for Pomodoro */}
      {mode === "pomodoro" && (
        <div className="flex gap-1 mb-3">
          {pomodoroPresets.map((preset, index) => (
            <button
              key={preset.label}
              onClick={() => handlePresetChange(index)}
              className={`
                flex-1 py-1 rounded text-xs font-kanit
                transition-colors border
                ${selectedPreset === index
                  ? "text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
                }
              `}
              style={{
                borderColor: 'rgba(255,255,255,0.3)',
                ...(selectedPreset === index ? { backgroundColor: primaryColor } : {})
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Control buttons */}
      <div className="flex gap-2">
        <motion.button
          onClick={() => setIsRunning(!isRunning)}
          className={`
            flex-1 py-2 rounded-lg border-2
            flex items-center justify-center gap-1
            font-kanit text-sm font-medium
            ${isRunning 
              ? "bg-[#FFE066] text-black" 
              : "bg-[#4ECDC4] text-white"
            }
          `}
          style={{ borderColor: 'rgba(255,255,255,0.3)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              หยุด
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              เริ่ม
            </>
          )}
        </motion.button>

        {mode === "stopwatch" && isRunning && (
          <motion.button
            onClick={handleLap}
            className="px-3 py-2 rounded-lg border-2 text-black"
            style={{ borderColor: 'rgba(255,255,255,0.3)', backgroundColor: '#E8D5F2' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flag className="w-4 h-4" />
          </motion.button>
        )}

        <motion.button
          onClick={handleReset}
          className="px-3 py-2 rounded-lg border-2 bg-white/10 text-white"
          style={{ borderColor: 'rgba(255,255,255,0.3)' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Laps display for stopwatch */}
      {mode === "stopwatch" && laps.length > 0 && (
        <div className="mt-3 max-h-20 overflow-y-auto">
          <p className="font-kanit text-xs text-white/60 mb-1">รอบที่บันทึก:</p>
          <div className="space-y-1">
            {laps.slice(-3).map((lap, index) => (
              <div 
                key={index}
                className="flex justify-between text-xs font-mono text-[#4ECDC4]/80"
              >
                <span>#{laps.length - 2 + index}</span>
                <span>{formatTime(lap)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
