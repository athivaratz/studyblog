"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSettings, UserSettings } from "@/lib/firebaseServices";

// Default colors
const DEFAULT_PRIMARY = "#00568C";
const DEFAULT_ACCENT = "#0080C0";

interface CustomColorsContextType {
  primaryColor: string;
  accentColor: string;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  loading: boolean;
}

const CustomColorsContext = createContext<CustomColorsContextType>({
  primaryColor: DEFAULT_PRIMARY,
  accentColor: DEFAULT_ACCENT,
  setPrimaryColor: () => {},
  setAccentColor: () => {},
  loading: true,
});

export function CustomColorsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [loading, setLoading] = useState(true);

  // Load colors from Firestore
  const loadColors = useCallback(async () => {
    if (!user) {
      setPrimaryColor(DEFAULT_PRIMARY);
      setAccentColor(DEFAULT_ACCENT);
      setLoading(false);
      return;
    }

    try {
      const settings = await getUserSettings(user.uid);
      if (settings?.customColors) {
        const newPrimary = settings.customColors.primary || DEFAULT_PRIMARY;
        const newAccent = settings.customColors.accent || DEFAULT_ACCENT;
        
        setPrimaryColor(newPrimary);
        setAccentColor(newAccent);
        
        // Also update CSS variables
        document.documentElement.style.setProperty("--primary-color", newPrimary);
        document.documentElement.style.setProperty("--accent-color", newAccent);
      }
    } catch (err) {
      console.warn("Could not load custom colors:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadColors();
  }, [loadColors]);

  // Update CSS variables when colors change
  const handleSetPrimaryColor = useCallback((color: string) => {
    setPrimaryColor(color);
    document.documentElement.style.setProperty("--primary-color", color);
  }, []);

  const handleSetAccentColor = useCallback((color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty("--accent-color", color);
  }, []);

  return (
    <CustomColorsContext.Provider
      value={{
        primaryColor,
        accentColor,
        setPrimaryColor: handleSetPrimaryColor,
        setAccentColor: handleSetAccentColor,
        loading,
      }}
    >
      {children}
    </CustomColorsContext.Provider>
  );
}

export function useCustomColors() {
  return useContext(CustomColorsContext);
}

// Hook for easy access to primary color only
export function usePrimaryColor(): string {
  const { primaryColor } = useContext(CustomColorsContext);
  return primaryColor;
}
