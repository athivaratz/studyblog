"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useSyncExternalStore, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  forceDarkMode: boolean;
  setForceDarkMode: (force: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// External store for hydration safety
function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void) {
  // Subscribe to window load event for hydration
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  return true;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for hydration-safe mounted state
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  // Force dark mode by default - change to false to enable light mode
  const [forceDarkMode, setForceDarkMode] = useState<boolean>(false);
  
  // Compute initial theme
  const getInitialTheme = useCallback((): Theme => {
    if (typeof window === "undefined") return "light";
    if (forceDarkMode) return "dark";
    const savedTheme = localStorage.getItem("studyblog-theme") as Theme | null;
    if (savedTheme) return savedTheme;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  }, [forceDarkMode]);
  
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme to DOM - only side effect, no setState
  useEffect(() => {
    if (mounted) {
      const effectiveTheme = forceDarkMode ? "dark" : theme;
      document.documentElement.classList.toggle("dark", effectiveTheme === "dark");
      if (!forceDarkMode) {
        localStorage.setItem("studyblog-theme", theme);
      }
    }
  }, [theme, mounted, forceDarkMode]);

  // Handle forceDarkMode change
  const handleSetForceDarkMode = useCallback((force: boolean) => {
    setForceDarkMode(force);
    if (force) {
      setThemeState("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (!forceDarkMode) {
      setThemeState((prev) => (prev === "light" ? "dark" : "light"));
    }
  }, [forceDarkMode]);

  const setTheme = useCallback((newTheme: Theme) => {
    if (!forceDarkMode) {
      setThemeState(newTheme);
    }
  }, [forceDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme: forceDarkMode ? "dark" : theme, toggleTheme, setTheme, forceDarkMode, setForceDarkMode: handleSetForceDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Re-export usePrimaryColor from CustomColorsContext for convenience
export { usePrimaryColor, useCustomColors } from "./CustomColorsContext";
