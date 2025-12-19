"use client";

import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useMusic } from "@/contexts/MusicContext";

interface MusicPlayerProps {
  className?: string;
}

export function MusicPlayer({ className = "" }: MusicPlayerProps) {
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

  return (
    <motion.div
      className={`
        bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D]
        border-3 border-black rounded-2xl
        p-4 w-[280px]
        shadow-hard
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Screen */}
      <div className="bg-[#C5E8FF] border-2 border-black rounded-lg p-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Album art */}
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-[#FFD6E0] to-[#E8D5F2] border-2 border-black rounded-lg flex items-center justify-center"
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
          >
            <span className="text-2xl">🎵</span>
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <p className="font-kanit font-medium text-sm truncate text-black">
              {tracks[currentTrack].title}
            </p>
            <p className="font-kanit text-xs text-black/60">
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
                  className="w-2 bg-[#FF6B6B] rounded-full"
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
            <p className="text-xs font-kanit text-black/40">กดเล่นเพื่อเริ่มฟังเพลง</p>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <motion.button 
          className="w-10 h-10 bg-[#FFF3B0] border-2 border-black rounded-full flex items-center justify-center shadow-hard-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeTrack("prev")}
        >
          <SkipBack className="w-4 h-4" />
        </motion.button>
        
        <motion.button 
          className="w-14 h-14 bg-[#FFD6E0] border-2 border-black rounded-full flex items-center justify-center shadow-hard"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </motion.button>
        
        <motion.button 
          className="w-10 h-10 bg-[#FFF3B0] border-2 border-black rounded-full flex items-center justify-center shadow-hard-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeTrack("next")}
        >
          <SkipForward className="w-4 h-4" />
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
