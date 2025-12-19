"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { PaperCard } from "@/components/ui";
import { Sparkles, BookOpen, Calendar, Brain } from "lucide-react";

export function LoginCard() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFF8E7] dark:bg-[#1A1A1A] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 text-6xl dark:opacity-60"
          animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          📚
        </motion.div>
        <motion.div
          className="absolute top-20 right-20 text-5xl dark:opacity-60"
          animate={{ rotate: [0, -15, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        >
          ✏️
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 text-5xl dark:opacity-60"
          animate={{ rotate: [0, 15, -15, 0], y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          🎒
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-10 text-6xl dark:opacity-60"
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
            <div className="inline-flex items-center gap-2 bg-[#FFE066] dark:bg-[#4D4A2A] px-4 py-2 rounded-full border-2 border-black dark:border-white/20 mb-4">
              <Sparkles className="w-5 h-5 text-black dark:text-white" />
              <span className="font-kanit text-sm font-medium text-black dark:text-white">Y2K Academic</span>
            </div>
            <h1 className="font-felipa text-5xl mb-2 text-black dark:text-white">Studygram</h1>
            <p className="font-kanit text-black/60 dark:text-white/60">
              จัดการการเรียนอย่างสนุกสนาน
            </p>
          </motion.div>

          {/* Features */}
          <motion.div 
            className="space-y-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <FeatureItem 
              icon={<BookOpen className="w-4 h-4" />}
              text="เชื่อมต่อ Google Classroom"
              color="pink"
            />
            <FeatureItem 
              icon={<Calendar className="w-4 h-4" />}
              text="ซิงค์กับ Google Calendar"
              color="blue"
            />
            <FeatureItem 
              icon={<Brain className="w-4 h-4" />}
              text="สร้าง Quiz ด้วย AI"
              color="green"
            />
          </motion.div>

          {/* Login Button */}
          <motion.button
            onClick={signInWithGoogle}
            disabled={loading}
            className={`
              w-full flex items-center justify-center gap-3 px-6 py-4
              bg-white dark:bg-[#3D3D3D] border-3 border-black dark:border-white/20 rounded-xl
              font-kanit text-lg font-medium text-black dark:text-white
              shadow-hard dark:shadow-none
              transition-all cursor-pointer
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-[#4D4D4D]"}
            `}
            whileHover={!loading ? { scale: 1.02, y: -2 } : undefined}
            whileTap={!loading ? { scale: 0.98 } : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
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
            className="text-center font-kanit text-xs text-black/40 mt-6"
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

function FeatureItem({ 
  icon, 
  text, 
  color 
}: { 
  icon: React.ReactNode; 
  text: string; 
  color: "pink" | "blue" | "green" | "yellow";
}) {
  const bgColors = {
    pink: "bg-[#FFD6E0] dark:bg-[#5C3A42]",
    blue: "bg-[#C5E8FF] dark:bg-[#2A3A4D]",
    green: "bg-[#D4F5D4] dark:bg-[#2A4D2A]",
    yellow: "bg-[#FFF3B0] dark:bg-[#4D4A2A]",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`
        w-8 h-8 rounded-lg border-2 border-black dark:border-white/20
        flex items-center justify-center dark:text-white
        ${bgColors[color]}
      `}>
        {icon}
      </div>
      <span className="font-kanit text-sm dark:text-white">{text}</span>
    </div>
  );
}
