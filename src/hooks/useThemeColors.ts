"use client";

import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";

/**
 * Shared theme color derivation hook.
 * Eliminates duplicated color logic across 15+ components.
 *
 * Usage:
 *   const { isDark, primaryColor, borderColor, shadowColor, ... } = useThemeColors();
 */
export function useThemeColors() {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  return {
    theme,
    isDark,
    primaryColor,

    // Text
    textColor: isDark ? "#FFFFFF" : "#1A1A1A",
    textMuted: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
    textFaint: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
    textSubtle: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",

    // Borders & shadows — derived from user's primary color
    borderColor: isDark ? "rgba(255,255,255,0.2)" : primaryColor,
    shadowColor: isDark ? "rgba(0,0,0,0.3)" : primaryColor,

    // Surfaces
    pageBg: isDark ? "#1A1A1A" : "#F5F5F5",
    cardBg: isDark ? "#2D2D2D" : "#FFFFFF",
    inputBg: isDark ? "#1A1A1A" : "#FFFFFF",
    dropdownBg: isDark ? "#3D3D3D" : "#FFFFFF",
    hoverBg: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",

    // Semantic (keep these as fixed colors for meaning)
    urgentColor: "#FF6B6B",
    successColor: isDark ? "#6EE7B7" : "#059669",
  };
}

/**
 * Subject / category color maps shared across pages.
 * Avoids duplicating the same map in 5+ files.
 */
export const subjectBgColors: Record<string, { light: string; dark: string }> = {
  yellow: { light: "#FFF3B0", dark: "#4D4A2A" },
  pink:   { light: "#FFD6E0", dark: "#5C3A42" },
  blue:   { light: "#C5E8FF", dark: "#2A3A4D" },
  green:  { light: "#D4F5D4", dark: "#2A4D2A" },
  purple: { light: "#E8D5F2", dark: "#3D2A4D" },
  orange: { light: "#FFE4C9", dark: "#4D3A2A" },
};

export function getSubjectBg(color: string, isDark: boolean): string {
  const entry = subjectBgColors[color] || subjectBgColors.yellow;
  return isDark ? entry.dark : entry.light;
}

export const categoryColors: Record<string, { light: string; dark: string }> = {
  homework: { light: "#FFD6E0", dark: "#5C3A42" },
  personal: { light: "#C5E8FF", dark: "#2A3A4D" },
  other:    { light: "#E8D5F2", dark: "#3D2A4D" },
};

export function getCategoryBg(category: string, isDark: boolean): string {
  const entry = categoryColors[category] || categoryColors.other;
  return isDark ? entry.dark : entry.light;
}
