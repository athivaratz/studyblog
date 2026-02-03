"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const PRIMARY_COLOR = "#00568C";

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = "กำลังโหลด studyblog..." }: LoadingScreenProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
    const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
    const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: pageBg }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border-4"
                    style={{
                        backgroundColor: cardBg,
                        borderColor: PRIMARY_COLOR,
                    }}
                >
                    <GraduationCap className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />
                </motion.div>
                <p className="font-kanit" style={{ color: textMuted }}>
                    {message}
                </p>
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
