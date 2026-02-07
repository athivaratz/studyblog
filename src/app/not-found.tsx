"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper-white)] dark:bg-[#2D2D2D] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full rounded-2xl p-8 bg-white dark:bg-[#353535]"
        style={{
          border: "2px solid var(--border-black)",
          boxShadow: "6px 6px 0px var(--border-black)",
        }}
      >
        {/* Fun 404 icon */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-7xl mb-4"
        >
          📂
        </motion.div>

        <h1 className="font-felipa text-6xl text-[var(--border-black)] dark:text-white mb-2">
          404
        </h1>

        <h2 className="font-kanit text-xl text-[var(--border-black)] dark:text-white mb-2">
          ไม่พบหน้านี้
        </h2>

        <p className="font-kanit text-sm text-gray-500 dark:text-gray-400 mb-8">
          หน้าที่คุณกำลังหาอาจถูกลบหรือย้ายไปแล้ว
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <motion.button
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-kanit text-sm font-medium text-white cursor-pointer"
              style={{
                backgroundColor: "var(--pastel-pink, #FFD6E0)",
                color: "#1A1A1A",
                border: "2px solid var(--border-black)",
                boxShadow: "3px 3px 0px var(--border-black)",
              }}
              whileHover={{ scale: 1.05, boxShadow: "5px 5px 0px var(--border-black)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-4 h-4" />
              กลับหน้าหลัก
            </motion.button>
          </Link>

          <motion.button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-kanit text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: "var(--pastel-yellow, #FFF3B0)",
              color: "#1A1A1A",
              border: "2px solid var(--border-black)",
              boxShadow: "3px 3px 0px var(--border-black)",
            }}
            whileHover={{ scale: 1.05, boxShadow: "5px 5px 0px var(--border-black)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </motion.button>
        </div>

        {/* Decorative stars */}
        <div className="mt-8 flex justify-center gap-2 text-lg opacity-50">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 0 }}>✧</motion.span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>✦</motion.span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}>✧</motion.span>
        </div>
      </motion.div>
    </div>
  );
}
