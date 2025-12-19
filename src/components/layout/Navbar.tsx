"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Folder, Calendar, BookOpen, Settings } from "lucide-react";
import { LoginButton } from "@/components/auth";
import { useTheme } from "@/contexts";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  darkColor: string;
}

const navItems: NavItem[] = [
  { icon: <Folder className="w-5 h-5" />, label: "วิชาเรียน", href: "/subjects", color: "#FFF3B0", darkColor: "#4D4A2A" },
  { icon: <Calendar className="w-5 h-5" />, label: "ปฏิทิน", href: "/calendar", color: "#C5E8FF", darkColor: "#2A3A4D" },
  { icon: <BookOpen className="w-5 h-5" />, label: "การบ้าน", href: "/homework", color: "#FFD6E0", darkColor: "#5C3A42" },
  { icon: <Settings className="w-5 h-5" />, label: "ตั้งค่า", href: "/settings", color: "#D4F5D4", darkColor: "#2A4D2A" },
];

export function Navbar() {
  const { theme } = useTheme();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="
        bg-[#FFFEF9] dark:bg-[#2D2D2D] border-2 border-black dark:border-white/20 rounded-2xl
        shadow-hard dark:shadow-none mx-0 lg:mx-4 mt-0 lg:mt-4 p-2 lg:p-4
        sticky top-0 lg:top-4 z-50
      "
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
          <motion.div
            className="
              w-9 h-9 lg:w-12 lg:h-12 bg-gradient-to-br from-[#FFD6E0] to-[#E8D5F2] 
              dark:from-[#5C3A42] dark:to-[#3D2A4D]
              border-2 border-black dark:border-white/20 rounded-xl
              flex items-center justify-center
              shadow-hard-sm dark:shadow-none
            "
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <span className="text-lg lg:text-2xl">📂</span>
          </motion.div>
          <div>
            <h1 className="font-felipa text-lg lg:text-2xl leading-tight dark:text-white">Studygram</h1>
            <p className="font-kanit text-[10px] lg:text-xs text-black/50 dark:text-white/50 hidden sm:block">Academic Organizer</p>
          </div>
        </Link>

        {/* Navigation items - Desktop only */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <motion.div
                  className="
                    flex items-center gap-2 px-4 py-2
                    border-2 border-black dark:border-white/20 rounded-xl
                    font-kanit text-sm font-medium dark:text-white
                    transition-colors
                  "
                  style={{ 
                    backgroundColor: `var(--nav-bg-${item.href.slice(1)}, ${item.color})` 
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "3px 3px 0px #1A1A1A" 
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Login/Profile Button */}
        <div className="hidden lg:block">
          <LoginButton variant="full" />
        </div>
        <div className="lg:hidden">
          <LoginButton variant="compact" />
        </div>
      </div>

      {/* Mobile Navigation - Bottom style */}
      <div className="lg:hidden flex items-center justify-around mt-2 pt-2 border-t-2 border-dashed border-black/20 dark:border-white/10">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              className="
                flex flex-col items-center gap-0.5 p-1
                rounded-xl cursor-pointer
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div
                className="w-8 h-8 border-2 border-black dark:border-white/20 rounded-lg flex items-center justify-center dark:text-white"
                style={{ backgroundColor: theme === 'dark' ? item.darkColor : item.color }}
              >
                {item.icon}
              </div>
              <span className="font-kanit text-[10px] dark:text-white/70">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
