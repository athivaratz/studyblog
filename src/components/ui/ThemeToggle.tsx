"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, forceDarkMode } = useTheme();
  const isDark = theme === "dark";

  // Don't render if dark mode is forced
  if (forceDarkMode) {
    return null;
  }

  const borderColor = isDark ? "rgba(255,255,255,0.3)" : "#000000";
  const boxShadow = isDark ? "none" : "4px 4px 0 #000";

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer"
      style={{
        borderColor,
        boxShadow,
        backgroundColor: isDark ? "#2D2D2D" : "#1A1A1A",
        color: isDark ? "#FCD34D" : "#FFFFFF"
      }}
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
}
