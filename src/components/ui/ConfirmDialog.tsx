"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const PRIMARY_COLOR = "#00568C";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "danger" | "warning" | "default";
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
    onConfirm,
    onCancel,
    variant = "danger",
}: ConfirmDialogProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const backdropBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
    const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
    const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
    const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
    const borderColor = PRIMARY_COLOR;

    const variantStyles = {
        danger: {
            iconBg: isDark ? "#5C3A3A" : "#FFE4E4",
            iconColor: "#EF4444",
            confirmBg: "#EF4444",
        },
        warning: {
            iconBg: isDark ? "#4D4A2A" : "#FFF3B0",
            iconColor: "#F59E0B",
            confirmBg: "#F59E0B",
        },
        default: {
            iconBg: isDark ? "#2A3A4D" : "#C5E8FF",
            iconColor: PRIMARY_COLOR,
            confirmBg: PRIMARY_COLOR,
        },
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    <div className="absolute inset-0" style={{ backgroundColor: backdropBg }} />

                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm z-10 rounded-2xl border-2 p-6"
                        style={{ backgroundColor: modalBg, borderColor }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-1 rounded-full transition-colors hover:opacity-70"
                            style={{ color: textMuted }}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: styles.iconBg }}
                            >
                                <AlertTriangle className="w-8 h-8" style={{ color: styles.iconColor }} />
                            </div>
                        </div>

                        {/* Title */}
                        <h3
                            className="font-kanit font-bold text-lg text-center mb-2"
                            style={{ color: textColor }}
                        >
                            {title}
                        </h3>

                        {/* Message */}
                        <p
                            className="font-kanit text-sm text-center mb-6"
                            style={{ color: textMuted }}
                        >
                            {message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <motion.button
                                onClick={onCancel}
                                className="flex-1 py-3 rounded-xl border-2 font-kanit font-medium"
                                style={{ borderColor, color: textColor }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {cancelText}
                            </motion.button>
                            <motion.button
                                onClick={onConfirm}
                                className="flex-1 py-3 rounded-xl border-2 font-kanit font-medium text-white"
                                style={{
                                    backgroundColor: styles.confirmBg,
                                    borderColor: styles.confirmBg,
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {confirmText}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
