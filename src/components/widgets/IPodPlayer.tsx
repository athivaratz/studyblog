"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useMusic, useTheme, usePrimaryColor } from "@/contexts";

interface IPodPlayerProps {
  className?: string;
}

export function IPodPlayer({ className = "" }: IPodPlayerProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { 
    isPlaying, 
    currentTrack: currentTrackIndex, 
    togglePlay, 
    changeTrack,
    tracks,
  } = useMusic();

  const currentTrackData = tracks[currentTrackIndex];
  const primaryColor = usePrimaryColor();
  
  // For light mode, use the iPod image from public
  // For dark mode, we'll create a dark styled version
  
  return (
    <div className={`relative ${className}`}>
      {/* iPod Container */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: 180,
          backgroundColor: isDark ? "#2D2D2D" : "#E8E8E8",
          border: `3px solid ${isDark ? "#404040" : "#C0C0C0"}`,
          boxShadow: isDark 
            ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" 
            : "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* Screen */}
        <div 
          className="mx-3 mt-3 rounded-lg overflow-hidden"
          style={{
            backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
            border: `2px solid ${isDark ? "#505050" : "#808080"}`,
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {/* Screen content */}
          <div className="p-3">
            {/* Now Playing header */}
            <div 
              className="text-center py-1 -mx-3 -mt-3 mb-2"
              style={{ 
                backgroundColor: primaryColor,
              }}
            >
              <p className="font-kanit text-xs text-white font-medium">
                MUSIC
              </p>
            </div>

            {/* Track info */}
            <div className="text-center space-y-1">
              <p 
                className="font-kanit text-sm font-medium truncate"
                style={{ color: isDark ? "#FFFFFF" : "#1A1A1A" }}
              >
                {currentTrackData?.title || "No Track"}
              </p>
              <p 
                className="font-kanit text-xs truncate"
                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}
              >
                {currentTrackData?.artist || "Unknown Artist"}
              </p>
            </div>

            {/* Progress bar */}
            <div 
              className="mt-3 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: isDark ? "#404040" : "#E0E0E0" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: primaryColor }}
                animate={{ width: isPlaying ? "100%" : "0%" }}
                transition={{ duration: 180, ease: "linear" }}
              />
            </div>

            {/* Track number */}
            <p 
              className="text-center font-mono text-xs mt-2"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            >
              {currentTrackIndex + 1} / {tracks.length}
            </p>
          </div>
        </div>

        {/* Click Wheel */}
        <div className="flex justify-center py-4">
          <div 
            className="relative rounded-full"
            style={{
              width: 120,
              height: 120,
              backgroundColor: isDark ? "#404040" : "#FFFFFF",
              border: `2px solid ${isDark ? "#505050" : "#C0C0C0"}`,
              boxShadow: isDark 
                ? "inset 0 2px 8px rgba(0,0,0,0.4)" 
                : "inset 0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {/* Menu button (top) */}
            <button
              className="absolute top-2 left-1/2 -translate-x-1/2 font-kanit text-xs font-medium"
              style={{ color: isDark ? "#808080" : "#606060" }}
            >
              MENU
            </button>

            {/* Previous button (left) */}
            <motion.button
              onClick={() => changeTrack("prev")}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1"
              style={{ color: isDark ? "#808080" : "#606060" }}
              whileHover={{ scale: 1.1, color: primaryColor }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipBack className="w-4 h-4" fill="currentColor" />
            </motion.button>

            {/* Next button (right) */}
            <motion.button
              onClick={() => changeTrack("next")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              style={{ color: isDark ? "#808080" : "#606060" }}
              whileHover={{ scale: 1.1, color: primaryColor }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward className="w-4 h-4" fill="currentColor" />
            </motion.button>

            {/* Play/Pause button (bottom) */}
            <motion.button
              onClick={togglePlay}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 p-1"
              style={{ color: isDark ? "#808080" : "#606060" }}
              whileHover={{ scale: 1.1, color: primaryColor }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" fill="currentColor" />
              ) : (
                <Play className="w-4 h-4" fill="currentColor" />
              )}
            </motion.button>

            {/* Center button */}
            <motion.button
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 45,
                height: 45,
                backgroundColor: isDark ? "#505050" : "#E8E8E8",
                border: `2px solid ${isDark ? "#606060" : "#C0C0C0"}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IPodPlayer;
