"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, Wifi } from "lucide-react";
import { RetroButton } from "./RetroButton";

export function NetworkWarningModal() {
  const [isOnline, setIsOnline] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);
    setShowModal(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowModal(false);
      setIsReconnecting(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowModal(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsReconnecting(true);
    
    // Try to fetch a small resource to check connection
    try {
      await fetch("https://www.google.com/favicon.ico", { 
        mode: "no-cors",
        cache: "no-store" 
      });
      // If fetch succeeds, connection might be back
      if (navigator.onLine) {
        setIsOnline(true);
        setShowModal(false);
      }
    } catch {
      // Connection still offline
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="
              w-full max-w-sm
              bg-[#2D2D2D] border-2 border-white/20 rounded-3xl
              p-6 text-center
              shadow-2xl
            "
          >
            {/* Icon */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="
                w-20 h-20 mx-auto mb-4
                bg-gradient-to-br from-red-500/20 to-orange-500/20
                border-2 border-red-500/50 rounded-2xl
                flex items-center justify-center
              "
            >
              <WifiOff className="w-10 h-10 text-red-400" />
            </motion.div>

            {/* Title */}
            <h2 className="font-felipa text-2xl text-white mb-2">
              ไม่มีการเชื่อมต่ออินเทอร์เน็ต
            </h2>

            {/* Description */}
            <p className="font-kanit text-sm text-white/60 mb-6">
              กรุณาตรวจสอบการเชื่อมต่อ Wi-Fi หรือข้อมูลมือถือของคุณแล้วลองอีกครั้ง
            </p>

            {/* Connection Status Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
              <span className="font-kanit text-xs text-white/50">
                {isOnline ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
              </span>
            </div>

            {/* Retry Button */}
            <RetroButton
              color="yellow"
              onClick={handleRetry}
              disabled={isReconnecting}
              className="w-full"
            >
              {isReconnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  กำลังตรวจสอบ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Wifi className="w-4 h-4" />
                  ลองเชื่อมต่ออีกครั้ง
                </span>
              )}
            </RetroButton>

            {/* Tips */}
            <div className="mt-6 p-3 bg-white/5 rounded-xl">
              <p className="font-kanit text-xs text-white/40">
                💡 ลองเปิด-ปิด โหมดเครื่องบิน หรือรีสตาร์ท Wi-Fi
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
