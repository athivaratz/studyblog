"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

interface Track {
  title: string;
  artist: string;
  url: string;
}

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: number;
  volume: number;
  isMuted: boolean;
  tracks: Track[];
  togglePlay: () => void;
  changeTrack: (direction: "prev" | "next") => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const tracks: Track[] = [
  {
    title: "Lofi Study Beats",
    artist: "Chill Vibes",
    url: "https://streams.ilovemusic.de/iloveradio17.mp3",
  },
  {
    title: "Study Session",
    artist: "Focus Music",
    url: "https://streams.ilovemusic.de/iloveradio17.mp3",
  },
];

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element only once
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio(tracks[currentTrack].url);
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
    }

    return () => {
      // Don't cleanup audio on unmount to persist across pages
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (direction: "prev" | "next") => {
    const wasPlaying = isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
    }

    let newIndex = currentTrack;
    if (direction === "next") {
      newIndex = (currentTrack + 1) % tracks.length;
    } else {
      newIndex = (currentTrack - 1 + tracks.length) % tracks.length;
    }

    setCurrentTrack(newIndex);

    if (audioRef.current) {
      audioRef.current.src = tracks[newIndex].url;
      if (wasPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTrack,
        volume,
        isMuted,
        tracks,
        togglePlay,
        changeTrack,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
