"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, usePrimaryColor } from "@/contexts";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";

interface LoginButtonProps {
  className?: string;
  variant?: "full" | "compact";
}

export function LoginButton({ className = "", variant = "full" }: LoginButtonProps) {
  const { user, userProfile, loading, signInWithGoogle, signOut } = useAuth();
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const borderColor = primaryColor;
  const shadowColor = isDark ? "#404040" : primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const avatarBg = primaryColor;

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: textMuted }} />
      </div>
    );
  }

  if (user) {
    return (
      <motion.div
        className={`flex items-center gap-2 lg:gap-3 ${className}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {variant === "full" && (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-8 h-8 rounded-full"
                style={{ border: `2px solid ${borderColor}` }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  border: `2px solid ${borderColor}`,
                  backgroundColor: avatarBg,
                }}
              >
                <User className="w-4 h-4" style={{ color: textColor }} />
              </div>
            )}
            <div className="hidden md:block">
              <p className="font-kanit text-sm font-medium leading-tight" style={{ color: textColor }}>
                {userProfile?.displayName || user.displayName || "ผู้ใช้"}
              </p>
              <p className="font-kanit text-xs" style={{ color: textMuted }}>
                {userProfile?.school || "ยินดีต้อนรับ!"}
              </p>
            </div>
          </div>
        )}
        
        <motion.button
          onClick={signOut}
          className="flex items-center gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg font-kanit text-sm text-white font-medium cursor-pointer"
          style={{
            backgroundColor: "#FF6B6B",
            border: `2px solid ${borderColor}`,
            boxShadow: `2px 2px 0px ${shadowColor}`,
          }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4" />
          {variant === "full" && <span className="hidden sm:inline">ออก</span>}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={signInWithGoogle}
      className={`flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-kanit text-xs lg:text-sm font-medium cursor-pointer ${className}`}
      style={{
        backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
        border: `2px solid ${borderColor}`,
        boxShadow: `2px 2px 0px ${shadowColor}`,
        color: textColor,
      }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24">
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
      <span className="hidden sm:inline">เข้าสู่ระบบด้วย Google</span>
      <span className="sm:hidden">เข้าสู่ระบบ</span>
    </motion.button>
  );
}
