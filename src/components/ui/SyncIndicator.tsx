"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudOff, RefreshCw, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

type SyncStatus = "synced" | "syncing" | "offline" | "error";

export function SyncIndicator() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const [status, setStatus] = useState<SyncStatus>("synced");
  const [showTooltip, setShowTooltip] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setStatus("synced");
    const handleOffline = () => setStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      setStatus("offline");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen for custom sync events
  useEffect(() => {
    const handleSyncStart = () => setStatus("syncing");
    const handleSyncEnd = () => {
      setStatus("synced");
      // Show synced status briefly
      setTimeout(() => setStatus("synced"), 2000);
    };
    const handleSyncError = () => setStatus("error");

    window.addEventListener("sync:start", handleSyncStart);
    window.addEventListener("sync:end", handleSyncEnd);
    window.addEventListener("sync:error", handleSyncError);

    return () => {
      window.removeEventListener("sync:start", handleSyncStart);
      window.removeEventListener("sync:end", handleSyncEnd);
      window.removeEventListener("sync:error", handleSyncError);
    };
  }, []);

  const statusConfig: Record<
    SyncStatus,
    { icon: React.ReactNode; color: string; label: string }
  > = {
    synced: {
      icon: <Check className="w-3 h-3" />,
      color: "#22C55E",
      label: t("sync.synced"),
    },
    syncing: {
      icon: <RefreshCw className="w-3 h-3 animate-spin" />,
      color: "#00568C",
      label: t("sync.syncing"),
    },
    offline: {
      icon: <CloudOff className="w-3 h-3" />,
      color: "#EF4444",
      label: t("sync.offline"),
    },
    error: {
      icon: <CloudOff className="w-3 h-3" />,
      color: "#F59E0B",
      label: t("sync.error"),
    },
  };

  const config = statusConfig[status];
  const bgColor = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div className="relative">
      <motion.div
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer"
        style={{
          backgroundColor: `${config.color}20`,
          border: `1px solid ${config.color}40`,
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.05 }}
      >
        <span style={{ color: config.color }}>{config.icon}</span>
        <span
          className="font-kanit text-[10px] hidden sm:inline"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg whitespace-nowrap z-50"
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <p className="font-kanit text-xs" style={{ color: config.color }}>
              {status === "synced" && t("sync.all_data_synced")}
              {status === "syncing" && t("sync.syncing_data")}
              {status === "offline" && t("sync.offline_mode")}
              {status === "error" && t("sync.sync_failed")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to trigger sync events from anywhere in the app
export function triggerSync(action: "start" | "end" | "error") {
  window.dispatchEvent(new CustomEvent(`sync:${action}`));
}
