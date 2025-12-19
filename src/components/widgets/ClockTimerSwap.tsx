"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock, Timer } from "lucide-react";

interface ClockTimerSwapProps {
  className?: string;
}

type TimerMode = "pomodoro" | "stopwatch";

export function ClockTimerSwap({ className = "" }: ClockTimerSwapProps) {
  const [showTimer, setShowTimer] = useState(false);

  const handleSwap = () => {
    setShowTimer(!showTimer);
  };

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {showTimer ? (
          <motion.div
            key="timer"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <TimerCard onSwap={handleSwap} />
          </motion.div>
        ) : (
          <motion.div
            key="clock"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <ClockCard onSwap={handleSwap} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================
// Clock Card Component
// =====================
function ClockCard({ onSwap }: { onSwap: () => void }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  return (
    <motion.div
      onClick={onSwap}
      className="
        bg-[#1A1A1A] border-3 border-black rounded-2xl
        p-5 w-[200px] cursor-pointer select-none
        shadow-hard
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Mode indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#39FF14]" />
          <span className="text-xs text-white/50 font-kanit">นาฬิกา</span>
        </div>
        <motion.div
          className="flex items-center gap-1 text-white/30 text-xs"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Timer className="w-3 h-3" />
          <span>กดเพื่อสลับ</span>
        </motion.div>
      </div>

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
        <p className="font-kanit text-sm text-white/80">วัน{dayNames[time.getDay()]}</p>
        <p className="font-kanit text-xs text-white/50">
          {time.getDate()} {monthNames[time.getMonth()]} {time.getFullYear() + 543}
        </p>
      </div>
    </motion.div>
  );
}

// =====================
// Timer Card Component
// =====================
function TimerCard({ onSwap }: { onSwap: () => void }) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60);
  const [selectedPreset, setSelectedPreset] = useState(0);

  const pomodoroPresets = [
    { label: "25m", time: 25 * 60 },
    { label: "45m", time: 45 * 60 },
    { label: "60m", time: 60 * 60 },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (mode === "pomodoro") {
          setTime((prev) => {
            if (prev <= 0) {
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setTime((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRunning(false);
    if (mode === "pomodoro") {
      setTime(pomodoroPresets[selectedPreset].time);
    } else {
      setTime(0);
    }
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRunning(!isRunning);
  };

  const handlePresetChange = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPreset(index);
    setTime(pomodoroPresets[index].time);
    setIsRunning(false);
  };

  const handleModeChange = (newMode: TimerMode, e: React.MouseEvent) => {
    e.stopPropagation();
    setMode(newMode);
    setIsRunning(false);
    if (newMode === "pomodoro") {
      setTime(pomodoroPresets[selectedPreset].time);
    } else {
      setTime(0);
    }
  };

  const progress =
    mode === "pomodoro"
      ? ((pomodoroPresets[selectedPreset].time - time) / pomodoroPresets[selectedPreset].time) * 100
      : 0;

  return (
    <motion.div
      onClick={onSwap}
      className="
        bg-[#1A1A1A] border-3 border-black rounded-2xl
        p-4 w-[200px] cursor-pointer select-none
        shadow-hard
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Mode indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${mode === "pomodoro" ? "text-[#FF6B6B]" : "text-[#4ECDC4]"}`} />
          <span className="text-xs text-white/50 font-kanit">จับเวลา</span>
        </div>
        <motion.div
          className="flex items-center gap-1 text-white/30 text-xs"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Clock className="w-3 h-3" />
          <span>กดเพื่อสลับ</span>
        </motion.div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={(e) => handleModeChange("pomodoro", e)}
          className={`
            flex-1 px-2 py-1 rounded-md text-xs font-kanit transition-colors cursor-pointer
            ${mode === "pomodoro" ? "bg-[#FF6B6B] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}
          `}
        >
          🍅 โพโมโดโร
        </button>
        <button
          onClick={(e) => handleModeChange("stopwatch", e)}
          className={`
            flex-1 px-2 py-1 rounded-md text-xs font-kanit transition-colors cursor-pointer
            ${mode === "stopwatch" ? "bg-[#4ECDC4] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}
          `}
        >
          ⏱️ จับเวลา
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative mb-2">
        {mode === "pomodoro" && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-[#FF6B6B] rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        )}
        <div
          className={`
            ${mode === "pomodoro" ? "bg-[#2A1515]" : "bg-[#152A28]"}
            border-2 border-black rounded-lg p-3
          `}
        >
          <div className="flex items-center justify-center">
            <span
              className={`
                font-mono text-3xl font-bold tracking-wider
                ${mode === "pomodoro" ? "text-[#FF6B6B]" : "text-[#4ECDC4]"}
              `}
            >
              {formatTime(time)}
            </span>
          </div>
        </div>
      </div>

      {/* Preset buttons (pomodoro only) */}
      {mode === "pomodoro" && (
        <div className="flex gap-1 mb-2">
          {pomodoroPresets.map((preset, index) => (
            <button
              key={preset.label}
              onClick={(e) => handlePresetChange(index, e)}
              className={`
                flex-1 py-1 rounded text-xs font-mono transition-colors cursor-pointer
                ${selectedPreset === index
                  ? "bg-[#FF6B6B] text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
                }
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Control buttons */}
      <div className="flex justify-center gap-2">
        <motion.button
          onClick={handleReset}
          className="
            w-10 h-10 rounded-full
            bg-white/10 hover:bg-white/20
            flex items-center justify-center
            transition-colors cursor-pointer
          "
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <RotateCcw className="w-4 h-4 text-white/60" />
        </motion.button>

        <motion.button
          onClick={handlePlayPause}
          className={`
            w-12 h-12 rounded-full
            flex items-center justify-center
            border-2 border-black shadow-hard-sm cursor-pointer
            ${isRunning
              ? "bg-[#FFE066]"
              : mode === "pomodoro"
              ? "bg-[#FF6B6B]"
              : "bg-[#4ECDC4]"
            }
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isRunning ? (
            <Pause className="w-5 h-5 text-black" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
