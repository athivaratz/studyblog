"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Clock, Timer } from "lucide-react";
import { useTheme, usePrimaryColor } from "@/contexts";

interface ClockTimerWidgetProps {
  size?: number;
  className?: string;
  id?: string;
}

type Mode = "clock" | "pomodoro" | "stopwatch";

export function ClockTimerWidget({ size = 150, className = "", id }: ClockTimerWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mode, setMode] = useState<Mode>("clock");
  const [time, setTime] = useState(new Date());

  // Timer states
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [selectedPreset, setSelectedPreset] = useState(0);

  // Stopwatch states
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  const primaryColor = usePrimaryColor();
  const bgColor = isDark ? "#1A1A1A" : "#FFFFFF";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const mutedColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const tickColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,86,140,0.3)";

  const pomodoroPresets = [
    { label: "25m", time: 25 * 60 },
    { label: "45m", time: 45 * 60 },
    { label: "60m", time: 60 * 60 },
  ];

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerRunning || mode !== "pomodoro") return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 0) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, mode]);

  // Stopwatch
  useEffect(() => {
    if (!stopwatchRunning || mode !== "stopwatch") return;
    const interval = setInterval(() => {
      setStopwatchSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [stopwatchRunning, mode]);

  // Clock calculations
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;
  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours + minutes / 60) / 12) * 360;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = () => {
    const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${days[time.getDay()]} ${time.getDate()} ${months[time.getMonth()]}`;
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "pomodoro") {
      setTimerRunning(false);
      setTimerSeconds(pomodoroPresets[selectedPreset].time);
    } else if (newMode === "stopwatch") {
      setStopwatchRunning(false);
      setStopwatchSeconds(0);
    }
  };

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setTimerSeconds(pomodoroPresets[index].time);
    setTimerRunning(false);
  };

  const handleReset = () => {
    if (mode === "pomodoro") {
      setTimerRunning(false);
      setTimerSeconds(pomodoroPresets[selectedPreset].time);
    } else if (mode === "stopwatch") {
      setStopwatchRunning(false);
      setStopwatchSeconds(0);
    }
  };

  const handlePlayPause = () => {
    if (mode === "pomodoro") {
      setTimerRunning(!timerRunning);
    } else if (mode === "stopwatch") {
      setStopwatchRunning(!stopwatchRunning);
    }
  };

  const timerProgress = mode === "pomodoro"
    ? ((pomodoroPresets[selectedPreset].time - timerSeconds) / pomodoroPresets[selectedPreset].time) * 100
    : 0;

  return (
    <div id={id} className={`flex flex-col items-center ${className}`}>
      {/* Mode Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-3"
        style={{ backgroundColor: isDark ? "#3D3D3D" : "#F0F0F0" }}
      >
        {[
          { id: "clock" as Mode, icon: Clock, label: "นาฬิกา" },
          { id: "pomodoro" as Mode, icon: Timer, label: "🍅" },
          { id: "stopwatch" as Mode, icon: Timer, label: "⏱️" },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => handleModeChange(tab.id)}
            className="px-3 py-1.5 rounded-lg font-kanit text-xs transition-colors"
            style={{
              backgroundColor: mode === tab.id ? primaryColor : "transparent",
              color: mode === tab.id ? "#FFFFFF" : mutedColor,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "clock" ? (
          <motion.div
            key="clock"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center"
          >
            {/* Analog Clock */}
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
              {/* Numbers */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x = Math.cos(angle) * (size / 2 - 20) + size / 2;
                const y = Math.sin(angle) * (size / 2 - 20) + size / 2;

                return (
                  <span
                    key={i}
                    className="absolute font-kanit font-bold"
                    style={{
                      left: x,
                      top: y,
                      transform: "translate(-50%, -50%)",
                      color: primaryColor,
                      fontSize: size < 160 ? 10 : 12,
                    }}
                  >
                    {i === 0 ? 12 : i}
                  </span>
                );
              })}

              {/* Hour hand */}
              <div
                className="absolute origin-bottom rounded-full"
                style={{
                  width: 5,
                  height: size * 0.22,
                  backgroundColor: primaryColor,
                  left: "50%",
                  bottom: "50%",
                  marginLeft: -2.5,
                  transform: `rotate(${hourDegrees}deg)`,
                  transition: "transform 0.3s ease-out",
                }}
              />

              {/* Minute hand */}
              <div
                className="absolute origin-bottom rounded-full"
                style={{
                  width: 3,
                  height: size * 0.32,
                  backgroundColor: primaryColor,
                  left: "50%",
                  bottom: "50%",
                  marginLeft: -1.5,
                  transform: `rotate(${minuteDegrees}deg)`,
                  transition: "transform 0.3s ease-out",
                }}
              />

              {/* Second hand */}
              <div
                className="absolute origin-bottom"
                style={{
                  width: 2,
                  height: size * 0.38,
                  backgroundColor: primaryColor,
                  left: "50%",
                  bottom: "50%",
                  marginLeft: -1,
                  transform: `rotate(${secondDegrees}deg)`,
                }}
              />

              {/* Center dot */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: primaryColor,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>

            {/* Digital Display */}
            <div className="text-center mt-2">
              <p className="font-mono text-xl font-bold" style={{ color: primaryColor }}>
                {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </p>
              <p className="font-kanit text-xs" style={{ color: mutedColor }}>
                {formatDate()}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center"
          >
            {/* Timer/Stopwatch Display */}
            <div
              className="relative rounded-full border-4 flex items-center justify-center"
              style={{
                width: size,
                height: size,
                backgroundColor: bgColor,
                borderColor: mode === "pomodoro" ? primaryColor : "#4ECDC4",
                boxShadow: `0 4px 20px ${mode === "pomodoro" ? `${primaryColor}4D` : "rgba(78,205,196,0.3)"}`,
              }}
            >
              {/* Progress ring for pomodoro */}
              {mode === "pomodoro" && (
                <svg
                  className="absolute inset-0"
                  style={{ transform: "rotate(-90deg)" }}
                  viewBox={`0 0 ${size} ${size}`}
                >
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - 8}
                    fill="none"
                    stroke={isDark ? `${primaryColor}33` : `${primaryColor}1A`}
                    strokeWidth="4"
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - 8}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * (size / 2 - 8)}
                    strokeDashoffset={2 * Math.PI * (size / 2 - 8) * (1 - timerProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              <div className="text-center z-10">
                <p
                  className="font-mono text-3xl font-bold"
                  style={{ color: mode === "pomodoro" ? primaryColor : "#4ECDC4" }}
                >
                  {formatTime(mode === "pomodoro" ? timerSeconds : stopwatchSeconds)}
                </p>
                <p className="font-kanit text-xs" style={{ color: mutedColor }}>
                  {mode === "pomodoro" ? "โพโมโดโร" : "นับเวลา"}
                </p>
              </div>
            </div>

            {/* Presets for pomodoro */}
            {mode === "pomodoro" && (
              <div className="flex gap-2 mt-3">
                {pomodoroPresets.map((preset, index) => (
                  <motion.button
                    key={preset.label}
                    onClick={() => handlePresetChange(index)}
                    className="px-3 py-1 rounded-lg font-mono text-xs border-2"
                    style={{
                      backgroundColor: selectedPreset === index ? primaryColor : "transparent",
                      borderColor: primaryColor,
                      color: selectedPreset === index ? "#FFFFFF" : primaryColor,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {preset.label}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-3 mt-3">
              <motion.button
                onClick={handleReset}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: mutedColor, color: mutedColor }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: (mode === "pomodoro" ? timerRunning : stopwatchRunning)
                    ? "#FFE066"
                    : mode === "pomodoro" ? primaryColor : "#4ECDC4",
                  color: (mode === "pomodoro" ? timerRunning : stopwatchRunning) ? "#1A1A1A" : "#FFFFFF",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {(mode === "pomodoro" ? timerRunning : stopwatchRunning) ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ClockTimerWidget;
