"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Settings, X, Check } from "lucide-react";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { createStudySession, updateDailyStats } from "@/lib/firebaseServices";

type PomodoroPhase = "work" | "break" | "long_break";

interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

const defaultSettings: PomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

export function PomodoroTimer() {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const handlePhaseCompleteRef = useRef<() => void>(() => {});

  // Theme colors
  const bgColor = isDark ? "#2D2D2D" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : primaryColor;

  const phaseColors: Record<PomodoroPhase, string> = {
    work: "#00568C",
    break: "#22C55E",
    long_break: "#8B5CF6",
  };

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pomodoro_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      if (phase === "work") {
        setTimeLeft(parsed.workMinutes * 60);
      }
    }
  }, []);

  // Save settings
  const saveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    localStorage.setItem("pomodoro_settings", JSON.stringify(newSettings));
    // Reset timer to new work time
    if (phase === "work" && !isRunning) {
      setTimeLeft(newSettings.workMinutes * 60);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (phase === "work") {
          setTotalWorkTime((prev) => prev + 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      handlePhaseCompleteRef.current();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, phase]);

  // Handle phase completion
  const handlePhaseComplete = useCallback(async () => {
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    // Browser notification
    if (Notification.permission === "granted") {
      new Notification(
        phase === "work" ? "🎉 เสร็จแล้ว! พักผ่อนเถอะ" : "💪 พร้อมทำงานต่อ!"
      );
    }

    if (phase === "work") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      // Save study session to Firebase
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        await createStudySession(user.uid, {
          type: "pomodoro",
          durationMinutes: settings.workMinutes,
          date: new Date(),
          completed: true,
        });
        await updateDailyStats(user.uid, today, {
          studyMinutes: settings.workMinutes,
        });
      }

      // Determine next phase
      if (newCompletedSessions % settings.sessionsBeforeLongBreak === 0) {
        setPhase("long_break");
        setTimeLeft(settings.longBreakMinutes * 60);
      } else {
        setPhase("break");
        setTimeLeft(settings.breakMinutes * 60);
      }
    } else {
      setPhase("work");
      setTimeLeft(settings.workMinutes * 60);
    }

    setIsRunning(false);
  }, [phase, completedSessions, settings, user]);

  // Keep ref in sync with latest callback
  useEffect(() => {
    handlePhaseCompleteRef.current = handlePhaseComplete;
  }, [handlePhaseComplete]);

  // Start/pause timer
  const toggleTimer = () => {
    if (!isRunning) {
      startTimeRef.current = new Date();
      // Request notification permission
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
    setIsRunning(!isRunning);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setPhase("work");
    setTimeLeft(settings.workMinutes * 60);
    startTimeRef.current = null;
  };

  // Skip to next phase
  const skipPhase = () => {
    if (phase === "work") {
      setPhase("break");
      setTimeLeft(settings.breakMinutes * 60);
    } else {
      setPhase("work");
      setTimeLeft(settings.workMinutes * 60);
    }
    setIsRunning(false);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress
  const totalSeconds =
    phase === "work"
      ? settings.workMinutes * 60
      : phase === "break"
      ? settings.breakMinutes * 60
      : settings.longBreakMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const phaseLabels: Record<PomodoroPhase, string> = {
    work: t("pomodoro.work"),
    break: t("pomodoro.break"),
    long_break: t("pomodoro.long_break"),
  };

  return (
    <div className="relative">
      {/* Hidden audio for notification */}
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

      <motion.div
        className="rounded-2xl border-2 p-4"
        style={{
          backgroundColor: bgColor,
          borderColor: phaseColors[phase],
          boxShadow: `4px 4px 0px ${phaseColors[phase]}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-felipa text-lg" style={{ color: textColor }}>
            {t("pomodoro.title")}
          </h3>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: textMuted }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Phase indicator */}
        <div className="flex justify-center gap-2 mb-4">
          {(["work", "break", "long_break"] as PomodoroPhase[]).map((p) => (
            <div
              key={p}
              className="px-3 py-1 rounded-full text-xs font-kanit transition-all"
              style={{
                backgroundColor: phase === p ? phaseColors[p] : "transparent",
                color: phase === p ? "#FFFFFF" : textMuted,
                border: `1px solid ${phaseColors[p]}`,
              }}
            >
              {phaseLabels[p]}
            </div>
          ))}
        </div>

        {/* Timer display */}
        <div className="relative flex items-center justify-center mb-4">
          <svg className="w-36 h-36 -rotate-90">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r="64"
              fill="none"
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="72"
              cy="72"
              r="64"
              fill="none"
              stroke={phaseColors[phase]}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 64}`}
              strokeDashoffset={`${2 * Math.PI * 64 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-felipa text-4xl"
              style={{ color: phaseColors[phase] }}
            >
              {formatTime(timeLeft)}
            </span>
            <span className="font-kanit text-xs" style={{ color: textMuted }}>
              {phaseLabels[phase]}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <motion.button
            onClick={resetTimer}
            className="p-2 rounded-lg border-2"
            style={{ borderColor: textMuted, color: textMuted }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={toggleTimer}
            className="p-4 rounded-full"
            style={{
              backgroundColor: phaseColors[phase],
              color: "#FFFFFF",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </motion.button>

          <motion.button
            onClick={skipPhase}
            className="p-2 rounded-lg border-2"
            style={{ borderColor: textMuted, color: textMuted }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Session counter */}
        <div className="mt-4 text-center">
          <p className="font-kanit text-xs" style={{ color: textMuted }}>
            {t("pomodoro.sessions")}: {completedSessions}/{settings.sessionsBeforeLongBreak}
          </p>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[90%] max-w-sm rounded-2xl border-2 p-6"
              style={{
                backgroundColor: bgColor,
                borderColor,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-felipa text-xl" style={{ color: textColor }}>
                  ตั้งค่า Pomodoro
                </h3>
                <button onClick={() => setShowSettings(false)}>
                  <X className="w-5 h-5" style={{ color: textMuted }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    เวลาทำงาน (นาที)
                  </label>
                  <input
                    type="number"
                    value={settings.workMinutes}
                    onChange={(e) =>
                      saveSettings({ ...settings, workMinutes: parseInt(e.target.value) || 25 })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: isDark ? "#3D3D3D" : "#F5F5F5",
                      borderColor,
                      color: textColor,
                    }}
                    min={1}
                    max={60}
                  />
                </div>

                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    เวลาพัก (นาที)
                  </label>
                  <input
                    type="number"
                    value={settings.breakMinutes}
                    onChange={(e) =>
                      saveSettings({ ...settings, breakMinutes: parseInt(e.target.value) || 5 })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: isDark ? "#3D3D3D" : "#F5F5F5",
                      borderColor,
                      color: textColor,
                    }}
                    min={1}
                    max={30}
                  />
                </div>

                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    เวลาพักยาว (นาที)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakMinutes}
                    onChange={(e) =>
                      saveSettings({
                        ...settings,
                        longBreakMinutes: parseInt(e.target.value) || 15,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: isDark ? "#3D3D3D" : "#F5F5F5",
                      borderColor,
                      color: textColor,
                    }}
                    min={1}
                    max={60}
                  />
                </div>

                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    รอบก่อนพักยาว
                  </label>
                  <input
                    type="number"
                    value={settings.sessionsBeforeLongBreak}
                    onChange={(e) =>
                      saveSettings({
                        ...settings,
                        sessionsBeforeLongBreak: parseInt(e.target.value) || 4,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: isDark ? "#3D3D3D" : "#F5F5F5",
                      borderColor,
                      color: textColor,
                    }}
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              <motion.button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 py-2 rounded-xl font-kanit text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check className="w-4 h-4" />
                บันทึก
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
