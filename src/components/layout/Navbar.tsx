"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Brain, Calendar, User } from "lucide-react";
import { useTheme } from "@/contexts";
import { useAuth } from "@/contexts/AuthContext";

/**
 * ================================================
 * RESPONSIVE NAVBAR COMPONENT
 * ================================================
 * 
 * Menu Items:
 * 1. To-Do - หน้าแรก + สิ่งที่ต้องทำ
 * 2. ตารางเรียน - จัดการตารางเรียน
 * 3. ทบทวน - ระบบทบทวนเนื้อหา + เกม
 * 
 * คลิกที่ Profile = ไปหน้า Settings
 * ปุ่ม Logout อยู่ใน Settings เท่านั้น
 * 
 * Compact Mode: ย่อ navbar ในหน้าอื่นๆ ที่ไม่ใช่หน้าแรก
 * ================================================
 */

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  darkColor: string;
  id?: string;
}

const primaryColor = "#00568C";

const navItems: NavItem[] = [
  { icon: <CheckSquare className="w-5 h-5" />, label: "To-Do", href: "/", color: "#C5E8FF", darkColor: "#1A3A4D" },
  { icon: <Calendar className="w-5 h-5" />, label: "ตารางเรียน", href: "/schedule", color: "#C5E8FF", darkColor: "#1A3A4D", id: "tour-nav-schedule" },
  { icon: <Brain className="w-5 h-5" />, label: "ทบทวน", href: "/review", color: "#C5E8FF", darkColor: "#1A3A4D", id: "tour-nav-review" },
];

// Profile Button (Click to go to Settings)
function ProfileButton({ compact = false }: { compact?: boolean }) {
  const { user, userProfile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const borderColor = primaryColor;
  const shadowColor = isDark ? "#404040" : primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const avatarBg = primaryColor;

  if (!user) return null;

  return (
    <Link href="/settings">
      <motion.div
        id="tour-profile"
        className="flex items-center gap-2 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className={compact ? "w-8 h-8 rounded-full" : "w-10 h-10 rounded-full"}
            style={{ border: `2px solid ${borderColor}`, boxShadow: `2px 2px 0px ${shadowColor}` }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className={compact ? "w-8 h-8 rounded-full flex items-center justify-center" : "w-10 h-10 rounded-full flex items-center justify-center"}
            style={{
              border: `2px solid ${borderColor}`,
              backgroundColor: avatarBg,
              boxShadow: `2px 2px 0px ${shadowColor}`,
            }}
          >
            <User className="w-4 h-4 text-white" />
          </div>
        )}

        {!compact && (
          <div className="hidden md:block">
            <p className="font-kanit text-sm font-medium leading-tight" style={{ color: textColor }}>
              {userProfile?.displayName || user.displayName || "ผู้ใช้"}
            </p>
            <p className="font-kanit text-xs" style={{ color: textMuted }}>
              คลิกเพื่อตั้งค่า
            </p>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

export function Navbar() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === "dark";

  // Check if we're on the home page - if not, use compact mode
  const isHomePage = pathname === "/";
  const isCompact = !isHomePage;

  // Theme-aware colors
  const navBg = isDark ? "#252525" : "#FFFFFF";
  const borderColor = primaryColor;
  const shadowColor = isDark ? "#404040" : primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const logoBgFrom = isDark ? "#1A3A4D" : "#C5E8FF";
  const logoBgTo = isDark ? "#0D2830" : "#E8F4FF";

  // Compact Navbar for non-home pages
  if (isCompact) {
    return (
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="rounded-2xl sticky top-0 z-50 mx-0 mt-0 p-2 sm:mx-2 sm:mt-2 sm:p-3 xl:mx-4 xl:mt-4 xl:p-4"
        style={{
          backgroundColor: navBg,
          border: `2px solid ${borderColor}`,
          boxShadow: `4px 4px 0px ${shadowColor}`,
        }}
      >
        <div className="flex items-center justify-between">
          {/* Home button (red circle) */}
          <Link href="/">
            <motion.div
              className="w-10 h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: "#FF6B6B",
                border: `2px solid ${borderColor}`,
                boxShadow: `2px 2px 0px ${shadowColor}`,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg xl:text-xl">🏠</span>
            </motion.div>
          </Link>

          {/* Page Title */}
          <h1
            className="font-felipa text-lg xl:text-2xl"
            style={{ color: textColor }}
          >
            {pathname === "/schedule" && "ตารางเรียน"}
            {pathname === "/review" && "ทบทวน"}
            {pathname === "/settings" && "ตั้งค่า"}
            {pathname === "/todo" && "To-Do"}
          </h1>

          {/* Profile (click to Settings) */}
          <ProfileButton compact />
        </div>
      </motion.nav>
    );
  }

  // Full Navbar for home page
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="rounded-2xl sticky top-0 z-50 mx-0 mt-0 p-2 sm:mx-2 sm:mt-2 sm:p-3 xl:mx-4 xl:mt-4 xl:p-4"
      style={{
        backgroundColor: navBg,
        border: `2px solid ${borderColor}`,
        boxShadow: `4px 4px 0px ${shadowColor}`,
      }}
    >
      <div className="flex items-center justify-between">
        {/* 
          ================================================
          LOGO - RESPONSIVE SIZE
          ================================================
        */}
        <Link href="/" className="flex items-center gap-2 xl:gap-3 group">
          <motion.div
            className="rounded-xl flex items-center justify-center w-9 h-9 xl:w-12 xl:h-12"
            style={{
              background: `linear-gradient(to bottom right, ${logoBgFrom}, ${logoBgTo})`,
              border: `2px solid ${borderColor}`,
              boxShadow: `2px 2px 0px ${shadowColor}`,
            }}
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <span className="text-lg xl:text-2xl">📂</span>
          </motion.div>
          <div>
            <h1
              className="font-felipa text-lg xl:text-2xl leading-tight"
              style={{ color: textColor }}
            >
              studyblog
            </h1>
            <p
              className="font-kanit hidden sm:block text-[10px] xl:text-xs"
              style={{ color: textMuted }}
            >
              Academic Organizer
            </p>
          </div>
        </Link>

        {/* 
          ================================================
          NAVIGATION ITEMS - DESKTOP ONLY (>= 1280px / xl:)
          ================================================
        */}
        <div className="hidden xl:flex items-center gap-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              id={(item as { id?: string }).id}
            >
              <Link href={item.href}>
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-kanit text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isDark ? item.darkColor : item.color,
                    border: `2px solid ${borderColor}`,
                    boxShadow: `2px 2px 0px ${shadowColor}`,
                    color: textColor,
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: `4px 4px 0px ${shadowColor}`
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

        {/* 
          ================================================
          PROFILE BUTTON - Click to go to Settings
          ================================================
        */}
        <ProfileButton />
      </div>

      {/* 
        ================================================
        BOTTOM NAVIGATION - MOBILE + TABLET ONLY (< 1280px)
        ================================================
      */}
      <div
        className="xl:hidden flex items-center justify-around mt-2 pt-2"
        style={{ borderTop: `2px dashed ${isDark ? '#505050' : 'rgba(0,0,0,0.2)'}` }}
      >
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              className="flex flex-col items-center gap-0.5 p-1 rounded-xl cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: isDark ? item.darkColor : item.color,
                  border: `2px solid ${borderColor}`,
                  boxShadow: `2px 2px 0px ${shadowColor}`,
                  color: textColor,
                }}
              >
                {item.icon}
              </div>
              <span
                className="font-kanit text-[10px] sm:text-[11px]"
                style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}
              >
                {item.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
