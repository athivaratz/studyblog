"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  forceDarkMode: boolean;
  setForceDarkMode: (force: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Force dark mode by default - change to false to enable light mode
  const [forceDarkMode, setForceDarkMode] = useState<boolean>(false);
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If force dark mode is enabled, always use dark theme
    if (forceDarkMode) {
      setThemeState("dark");
      return;
    }
    // Otherwise check localStorage or system preference
    const savedTheme = localStorage.getItem("studyblog-theme") as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    } else {
      setThemeState("light");
    }
  }, [forceDarkMode]);

  useEffect(() => {
    if (mounted) {
      // Always apply dark mode if forced
      const effectiveTheme = forceDarkMode ? "dark" : theme;
      document.documentElement.classList.toggle("dark", effectiveTheme === "dark");
      if (!forceDarkMode) {
        localStorage.setItem("studyblog-theme", theme);
      }
    }
  }, [theme, mounted, forceDarkMode]);

  const toggleTheme = () => {
    // Only allow toggle if not forced
    if (!forceDarkMode) {
      setThemeState((prev) => (prev === "light" ? "dark" : "light"));
    }
  };

  const setTheme = (newTheme: Theme) => {
    if (!forceDarkMode) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: forceDarkMode ? "dark" : theme, toggleTheme, setTheme, forceDarkMode, setForceDarkMode }}>
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
