"use client";

import { motion } from "framer-motion";
import { Clock, Music } from "lucide-react";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";

interface MobileHeaderProps {
    onUtilitiesClick: () => void;
}

export function MobileHeader({ onUtilitiesClick }: MobileHeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const primaryColor = usePrimaryColor();
    const isDark = theme === "dark";

    const headerBg = isDark ? "#252525" : "#FFFFFF";
    const borderColor = primaryColor;
    const buttonBg = isDark ? "#3D3D3D" : "#F0F0F0";

    return (
        <div
            className="xl:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between border-b-2"
            style={{ backgroundColor: headerBg, borderColor }}
        >
            {/* Left side: Utilities only */}
            <motion.button
                id="tour-utils-mobile"
                onClick={onUtilitiesClick}
                className="flex items-center gap-2 px-3 py-2 text-white rounded-xl border-2"
                style={{ backgroundColor: primaryColor, borderColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Clock className="w-4 h-4" />
                <Music className="w-4 h-4" />
            </motion.button>

            {/* Right side: Theme toggle */}
            <motion.button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                style={{ backgroundColor: buttonBg, borderColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isDark ? (
                    <span className="text-lg">☀️</span>
                ) : (
                    <span className="text-lg">🌙</span>
                )}
            </motion.button>
        </div>
    );
}
