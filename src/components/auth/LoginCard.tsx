"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { PaperCard } from "@/components/ui";
import { Sparkles, BookOpen, Calendar, Brain, ExternalLink, Copy, Check, AlertTriangle } from "lucide-react";

export function LoginCard() {
  const { signInWithGoogle, loading, isWebView, isMobile, isSupportedBrowser } = useAuth();
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Get current URL on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Determine if we should show warning
  const showWarning = isWebView || (isMobile && !isSupportedBrowser);

  const handleLoginClick = async () => {
    console.log("Login button clicked!");
    console.log("Loading:", loading);
    console.log("showWarning:", showWarning);
    console.log("isWebView:", isWebView);
    console.log("isMobile:", isMobile);
    console.log("isSupportedBrowser:", isSupportedBrowser);
    
    try {
      await signInWithGoogle();
      console.log("signInWithGoogle completed");
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  // Theme colors
  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const decorOpacity = isDark ? 0.6 : 1;
  const badgeBg = isDark ? "#4D4A2A" : "#FFE066";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const btnBg = isDark ? "#3D3D3D" : "#FFFFFF";
  const btnHoverBg = isDark ? "#4D4D4D" : "#F9FAFB";
  const boxShadow = isDark ? "none" : `4px 4px 0 ${primaryColor}`;
  const spinnerBorder = isDark ? "#FFFFFF" : primaryColor;
  const warningBg = isDark ? "#4D3A2A" : "#FFF3CD";
  const warningBorder = isDark ? "#FF9800" : "#FFC107";
  const warningText = isDark ? "#FFD54F" : "#856404";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: pageBg }}>
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 text-6xl"
          style={{ opacity: decorOpacity }}
          animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          📚
        </motion.div>
        <motion.div
          className="absolute top-20 right-20 text-5xl"
          style={{ opacity: decorOpacity }}
          animate={{ rotate: [0, -15, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        >
          ✏️
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 text-5xl"
          style={{ opacity: decorOpacity }}
          animate={{ rotate: [0, 15, -15, 0], y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          🎒
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-10 text-6xl"
          style={{ opacity: decorOpacity }}
          animate={{ rotate: [0, -10, 10, 0], y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 0.3 }}
        >
          📖
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >
        <PaperCard color="cream" className="p-8">
          {/* Logo */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div 
            >
            </div>
            <h1 className="font-felipa text-5xl mb-2" style={{ color: textColor }}>studyblog</h1>
            <p className="font-kanit" style={{ color: textMuted }}>
              จัดการการเรียนอย่างสนุกสนาน
            </p>
          </motion.div>



          {/* Browser Warning */}
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 rounded-xl border-2"
                style={{
                  backgroundColor: warningBg,
                  borderColor: warningBorder,
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: warningBorder }} />
                  <p className="font-kanit text-sm font-medium" style={{ color: warningText }}>
                    {isWebView 
                      ? "เบราว์เซอร์ในแอปไม่รองรับการเข้าสู่ระบบ Google"
                      : "กรุณาใช้ Chrome หรือ Safari เท่านั้น"}
                  </p>
                </div>
                <p className="font-kanit text-xs mb-3" style={{ color: warningText }}>
                  กรุณาเปิดลิงก์นี้ใน Chrome หรือ Safari เพื่อเข้าสู่ระบบ
                </p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 font-kanit text-xs font-medium cursor-pointer"
                    style={{
                      backgroundColor: isDark ? "#3D3D3D" : "#FFFFFF",
                      borderColor: warningBorder,
                      color: warningText,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกลิงก์</span>
                      </>
                    )}
                  </motion.button>
                  <motion.a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 font-kanit text-xs font-medium cursor-pointer no-underline"
                    style={{
                      backgroundColor: warningBorder,
                      borderColor: warningBorder,
                      color: isDark ? "#1A1A1A" : "#1A1A1A",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดในเบราว์เซอร์</span>
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Button */}
          <motion.button
            onClick={handleLoginClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-3 rounded-xl font-kanit text-lg font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: btnBg,
              borderColor,
              color: textColor,
              boxShadow,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            whileHover={!loading ? { scale: 1.02, y: -2, backgroundColor: btnHoverBg } : undefined}
            whileTap={!loading ? { scale: 0.98 } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {loading ? (
              <div 
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: spinnerBorder, borderTopColor: "transparent" }}
              />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </motion.button>

          {/* Footer */}
          <motion.p 
            className="text-center font-kanit text-xs mt-6"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            เมื่อเข้าสู่ระบบ คุณยอมรับเงื่อนไขการใช้งาน
          </motion.p>
        </PaperCard>
      </motion.div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
  color: "pink" | "blue" | "green" | "yellow";
  isDark: boolean;
}

function FeatureItem({ icon, text, color, isDark }: FeatureItemProps) {
  const lightBgColors = {
    pink: "#FFD6E0",
    blue: "#C5E8FF",
    green: "#D4F5D4",
    yellow: "#FFF3B0",
  };
  
  const darkBgColors = {
    pink: "#5C3A42",
    blue: "#2A3A4D",
    green: "#2A4D2A",
    yellow: "#4D4A2A",
  };

  const bgColor = isDark ? darkBgColors[color] : lightBgColors[color];
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#000000";
  const textColor = isDark ? "#FFFFFF" : "#000000";

  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-8 h-8 rounded-lg border-2 flex items-center justify-center"
        style={{ backgroundColor: bgColor, borderColor, color: textColor }}
      >
        {icon}
      </div>
      <span className="font-kanit text-sm" style={{ color: textColor }}>{text}</span>
    </div>
  );
}
