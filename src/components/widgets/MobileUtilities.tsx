"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Clock, X, Music } from "lucide-react";
import { ClockTimerWidget } from "./ClockTimerWidget";
import { useMusic } from "@/contexts/MusicContext";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";

interface MobileUtilitiesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileUtilities({ isOpen, onClose }: MobileUtilitiesProps) {
  const [activeTab, setActiveTab] = useState<"clock" | "music">("clock");
  const { isPlaying, currentTrack, tracks, togglePlay, changeTrack } = useMusic();
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  // Theme colors
  const sheetBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const handleBg = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,86,140,0.3)";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  
  // Tab colors
  const clockActiveBg = isDark ? "#1A3A4D" : "#C5E8FF";
  const musicActiveBg = isDark ? "#1A3A4D" : "#C5E8FF";
  
  // Music player colors
  const musicCardBg = isDark ? "#1A3A4D" : "#E8F4FF";
  const controlBtnBg = isDark ? "#2D4D5D" : "#C5E8FF";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t-2 border-x-2 shadow-2xl max-h-[80vh] overflow-hidden"
            style={{ backgroundColor: sheetBg, borderColor }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: handleBg }} />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-4 p-2 rounded-full transition-colors hover:bg-black/10"
              style={{ color: textColor }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tab switcher */}
            <div className="flex gap-2 px-4 mb-4">
              <button
                onClick={() => setActiveTab("clock")}
                className="flex-1 py-2 px-4 rounded-xl font-kanit text-sm border-2 transition-all"
                style={{ 
                  color: activeTab === "clock" ? "#FFFFFF" : textColor,
                  backgroundColor: activeTab === "clock" ? primaryColor : "transparent",
                  borderColor: primaryColor
                }}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                นาฬิกา/จับเวลา
              </button>
              <button
                onClick={() => setActiveTab("music")}
                className="flex-1 py-2 px-4 rounded-xl font-kanit text-sm border-2 transition-all"
                style={{ 
                  color: activeTab === "music" ? "#FFFFFF" : textColor,
                  backgroundColor: activeTab === "music" ? primaryColor : "transparent",
                  borderColor: primaryColor
                }}
              >
                <Music className="w-4 h-4 inline mr-2" />
                เพลง
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-8">
              {activeTab === "clock" ? (
                <div className="flex justify-center">
                  <ClockTimerWidget size={180} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Now playing */}
                  <div 
                    className="border-2 rounded-xl p-4"
                    style={{ backgroundColor: musicCardBg, borderColor }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                        transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
                      >
                        <span className="text-2xl">🎵</span>
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-kanit font-medium" style={{ color: textColor }}>
                          {tracks[currentTrack].title}
                        </p>
                        <p className="font-kanit text-sm" style={{ color: textMuted }}>
                          {tracks[currentTrack].artist}
                        </p>
                      </div>
                    </div>

                    {/* Equalizer */}
                    <div className="flex items-end justify-center gap-1 h-8 mt-3">
                      {isPlaying ? (
                        [...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-2 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                            animate={{ height: [4, 12 + (i % 4) * 6, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                          />
                        ))
                      ) : (
                        <p className="text-sm font-kanit" style={{ color: textMuted }}>
                          กดเล่นเพื่อเริ่มฟังเพลง
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      onClick={() => changeTrack("prev")}
                      className="w-12 h-12 border-2 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: controlBtnBg, borderColor, color: textColor }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipBack className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: primaryColor, 
                        color: "#FFFFFF",
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7" />
                      ) : (
                        <Play className="w-7 h-7 ml-1" />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={() => changeTrack("next")}
                      className="w-12 h-12 border-2 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: controlBtnBg, borderColor, color: textColor }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipForward className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
