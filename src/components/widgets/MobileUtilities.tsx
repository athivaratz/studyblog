"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Clock, X, Music } from "lucide-react";
import { ClockTimerSwap } from "./ClockTimerSwap";
import { useMusic } from "@/contexts/MusicContext";

interface MobileUtilitiesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileUtilities({ isOpen, onClose }: MobileUtilitiesProps) {
  const [activeTab, setActiveTab] = useState<"clock" | "music">("clock");
  const { isPlaying, currentTrack, tracks, togglePlay, changeTrack } = useMusic();

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFEF9] dark:bg-[#2D2D2D] rounded-t-3xl border-t-3 border-x-3 border-black dark:border-white/20 shadow-2xl max-h-[70vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-black/20 dark:bg-white/20 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5 dark:text-white" />
            </button>

            {/* Tab switcher */}
            <div className="flex gap-2 px-4 mb-4">
              <button
                onClick={() => setActiveTab("clock")}
                className={`flex-1 py-2 px-4 rounded-xl font-kanit text-sm border-2 transition-all dark:text-white ${
                  activeTab === "clock"
                    ? "bg-[#FFF3B0] dark:bg-[#3D3A2A] border-black dark:border-white/30"
                    : "border-transparent hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                นาฬิกา/จับเวลา
              </button>
              <button
                onClick={() => setActiveTab("music")}
                className={`flex-1 py-2 px-4 rounded-xl font-kanit text-sm border-2 transition-all dark:text-white ${
                  activeTab === "music"
                    ? "bg-[#FFD6E0] dark:bg-[#3D2A30] border-black dark:border-white/30"
                    : "border-transparent hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <Music className="w-4 h-4 inline mr-2" />
                เพลง
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-8">
              {activeTab === "clock" ? (
                <div className="flex justify-center">
                  <ClockTimerSwap />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Now playing */}
                  <div className="bg-[#C5E8FF] dark:bg-[#2A3540] border-2 border-black dark:border-white/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-14 h-14 bg-gradient-to-br from-[#FFD6E0] to-[#E8D5F2] border-2 border-black rounded-lg flex items-center justify-center"
                        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                        transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
                      >
                        <span className="text-2xl">🎵</span>
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-kanit font-medium dark:text-white">{tracks[currentTrack].title}</p>
                        <p className="font-kanit text-sm text-black/60 dark:text-white/60">
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
                            className="w-2 bg-[#FF6B6B] rounded-full"
                            animate={{ height: [4, Math.random() * 24 + 4, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                          />
                        ))
                      ) : (
                        <p className="text-sm font-kanit text-black/40 dark:text-white/40">
                          กดเล่นเพื่อเริ่มฟังเพลง
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      onClick={() => changeTrack("prev")}
                      className="w-12 h-12 bg-[#FFF3B0] dark:bg-[#3D3A2A] border-2 border-black dark:border-white/30 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipBack className="w-5 h-5 dark:text-white" />
                    </motion.button>

                    <motion.button
                      onClick={togglePlay}
                      className="w-16 h-16 bg-[#FFD6E0] dark:bg-[#3D2A30] border-2 border-black dark:border-white/30 rounded-full flex items-center justify-center shadow-hard dark:shadow-none"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 dark:text-white" />
                      ) : (
                        <Play className="w-7 h-7 ml-1 dark:text-white" />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={() => changeTrack("next")}
                      className="w-12 h-12 bg-[#FFF3B0] dark:bg-[#3D3A2A] border-2 border-black dark:border-white/30 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipForward className="w-5 h-5 dark:text-white" />
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
