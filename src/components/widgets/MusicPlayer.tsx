"use client";

import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useMusic } from "@/contexts/MusicContext";
import { useTheme } from "@/contexts";

interface MusicPlayerProps {
  className?: string;
}

export function MusicPlayer({ className = "" }: MusicPlayerProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { 
    isPlaying, 
    currentTrack, 
    volume, 
    isMuted, 
    tracks, 
    togglePlay, 
    changeTrack, 
    setVolume, 
    toggleMute 
  } = useMusic();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // Theme-aware styling
  const borderColor = isDark ? "#606060" : "#1A1A1A";
  const shadowColor = isDark ? "#404040" : "#1A1A1A";

  return (
    <motion.div
      className={`rounded-2xl p-4 w-[280px] ${className}`}
      style={{
        background: isDark 
          ? "linear-gradient(to bottom right, #1A1A1A, #2D2D2D)" 
          : "linear-gradient(to bottom right, #2D2D2D, #3D3D3D)",
        border: `3px solid ${borderColor}`,
        boxShadow: `4px 4px 0px ${shadowColor}`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Screen */}
      <div 
        className="rounded-lg p-3 mb-4"
        style={{
          backgroundColor: isDark ? "#35404D" : "#C5E8FF",
          border: `2px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Album art */}
          <motion.div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              background: isDark 
                ? "linear-gradient(to bottom right, #4D3540, #453550)"
                : "linear-gradient(to bottom right, #FFD6E0, #E8D5F2)",
              border: `2px solid ${borderColor}`,
            }}
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
          >
            <span className="text-2xl">🎵</span>
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <p className={`font-kanit font-medium text-sm truncate ${isDark ? 'text-white' : 'text-black'}`}>
              {tracks[currentTrack].title}
            </p>
            <p className={`font-kanit text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              {tracks[currentTrack].artist}
            </p>
          </div>
        </div>
        
        {/* Animated equalizer when playing */}
        <div className="mt-3 flex items-end justify-center gap-1 h-6">
          {isPlaying ? (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  className={`w-2 rounded-full ${isDark ? 'bg-[#FF8A8A]' : 'bg-[#FF6B6B]'}`}
                  animate={{
                    height: [4, Math.random() * 20 + 4, 4],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </>
          ) : (
            <p className={`text-xs font-kanit ${isDark ? 'text-white/40' : 'text-black/40'}`}>
              กดเล่นเพื่อเริ่มฟังเพลง
            </p>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <motion.button 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isDark ? "#4A4530" : "#FFF3B0",
            border: `2px solid ${borderColor}`,
            boxShadow: `2px 2px 0px ${shadowColor}`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeTrack("prev")}
        >
          <SkipBack className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
        </motion.button>
        
        <motion.button 
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isDark ? "#4D3540" : "#FFD6E0",
            border: `2px solid ${borderColor}`,
            boxShadow: `4px 4px 0px ${shadowColor}`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
          ) : (
            <Play className={`w-6 h-6 ml-1 ${isDark ? 'text-white' : 'text-black'}`} />
          )}
        </motion.button>
        
        <motion.button 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isDark ? "#4A4530" : "#FFF3B0",
            border: `2px solid ${borderColor}`,
            boxShadow: `2px 2px 0px ${shadowColor}`,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeTrack("next")}
        >
          <SkipForward className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
        </motion.button>
      </div>
      
      {/* Volume */}
      <div className="flex items-center gap-2 mt-4 px-2">
        <motion.button
          onClick={toggleMute}
          whileTap={{ scale: 0.9 }}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-white/60" />
          ) : (
            <Volume2 className="w-4 h-4 text-white/60" />
          )}
        </motion.button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#C5E8FF]
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-black
          "
        />
      </div>
    </motion.div>
  );
}
