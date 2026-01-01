"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout";
import { FolderCard } from "@/components/ui";
import { IPodPlayer, ClockTimerWidget, MobileUtilities } from "@/components/widgets";
import { TutorialOverlay } from "@/components/tutorial";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useUserSettings, useInitializeUser } from "@/hooks/useFirebaseData";
import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  Moon,
  Music,
  Globe,
  LogOut,
  Loader2,
  ChevronRight,
  Smartphone,
  HelpCircle,
  Heart,
  Clock,
  GraduationCap
} from "lucide-react";
import { useState } from "react";

// Primary color
const primaryColor = "#00568C";

// Loading Screen
function LoadingScreen() {
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
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ 
            backgroundColor: cardBg, 
            border: `3px solid ${primaryColor}`,
          }}
        >
          <GraduationCap className="w-8 h-8" style={{ color: primaryColor }} />
        </motion.div>
        <p className="font-kanit" style={{ color: textMuted }}>กำลังโหลด...</p>
      </motion.div>
    </div>
  );
}

// Mobile Header - Updated layout
function MobileHeader({ 
  onUtilitiesClick
}: { 
  onUtilitiesClick: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  
  const headerBg = isDark ? "#252525" : "#FFFFFF";
  const borderColor = primaryColor;
  const buttonBg = isDark ? "#3D3D3D" : "#F0F0F0";

  return (
    <div 
      className="xl:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between border-b-2"
      style={{ backgroundColor: headerBg, borderColor }}
    >
      {/* Left side: Utilities only */}
      <motion.button
        onClick={onUtilitiesClick}
        className="flex items-center gap-2 px-3 py-2 text-white rounded-xl border-2"
        style={{ backgroundColor: primaryColor, borderColor }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Clock className="w-4 h-4" />
        <Music className="w-4 h-4" />
      </motion.button>

      {/* Right side: Theme toggle */}
      <motion.button
        onClick={toggleTheme}
        className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
        style={{ backgroundColor: buttonBg, borderColor }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDark ? (
          <span className="text-lg">☀️</span>
        ) : (
          <span className="text-lg">🌙</span>
        )}
      </motion.button>
    </div>
  );
}

// Setting Item Component
function SettingItem({
  icon,
  label,
  description,
  value,
  isToggle = false,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string | boolean;
  isToggle?: boolean;
  onChange?: (value: boolean) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const textFaint = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  const iconBg = isDark ? "#3D3D3D" : "#E8F4FF";
  const hoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  return (
    <motion.div
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-colors cursor-pointer"
      whileHover={{ x: 4, backgroundColor: hoverBg }}
    >
      {/* Icon */}
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg, color: primaryColor }}
      >
        {icon}
      </div>
      
      {/* Label & Description */}
      <div className="flex-1 min-w-0">
        <p className="font-kanit font-medium text-sm sm:text-base truncate" style={{ color: textColor }}>
          {label}
        </p>
        {description && (
          <p className="font-kanit text-[10px] sm:text-xs line-clamp-2" style={{ color: textMuted }}>
            {description}
          </p>
        )}
      </div>
      
      {/* Toggle / Value / Arrow */}
      {isToggle ? (
        <motion.button
          onClick={() => onChange?.(!value)}
          className="w-12 h-7 rounded-full border-2 p-0.5 transition-colors cursor-pointer shrink-0"
          style={{ 
            borderColor: primaryColor,
            backgroundColor: value ? primaryColor : (isDark ? "#4B5563" : "#E5E7EB")
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
            animate={{ x: value ? 18 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
      ) : value ? (
        <span className="font-kanit text-xs sm:text-sm shrink-0" style={{ color: textMuted }}>
          {value}
        </span>
      ) : (
        <ChevronRight className="w-5 h-5 shrink-0" style={{ color: textFaint }} />
      )}
    </motion.div>
  );
}

// Settings Dashboard
function SettingsDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const textFaint = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleToggleSetting = async (key: string, value: boolean) => {
    await updateSettings({ [key]: value });
  };

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: pageBg }}
    >
      {/* Main Layout */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Navigation */}
        <Navbar />

        {/* Content Grid */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6">
          {/* Left Sidebar - iPod & Clock (Desktop only) */}
          <div className="hidden xl:flex flex-col gap-6">
            <IPodPlayer />
            <ClockTimerWidget size={180} />
          </div>

          {/* Main Content */}
          <div className="space-y-6 max-w-2xl">
            {/* Profile Card */}
            <FolderCard title="โปรไฟล์">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Profile Image */}
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 overflow-hidden shrink-0"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "Profile"} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h2 className="font-felipa text-xl sm:text-2xl truncate" style={{ color: textColor }}>
                    {userProfile?.displayName || user?.displayName || "นักเรียน"}
                  </h2>
                  <p className="font-kanit text-xs sm:text-sm truncate" style={{ color: textMuted }}>
                    {user?.email}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-kanit"
                      style={{ backgroundColor: isDark ? "#2A4D2A" : "#D4F5D4", color: textColor }}
                    >
                      ✅ บัญชี Google
                    </span>
                  </div>
                </div>
                
                {/* Edit Button */}
                <motion.button
                  className="px-4 py-2 rounded-xl border-2 font-kanit text-sm font-medium"
                  style={{ 
                    backgroundColor: primaryColor, 
                    borderColor: primaryColor,
                    color: "#FFFFFF" 
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  แก้ไข
                </motion.button>
              </div>
            </FolderCard>

            {/* Settings Card */}
            <FolderCard title="การตั้งค่า">
              {settingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                </div>
              ) : (
                <div className="space-y-1">
                  <SettingItem
                    icon={<Bell className="w-5 h-5" />}
                    label="การแจ้งเตือน"
                    description="รับการแจ้งเตือนเมื่อถึงกำหนดส่งการบ้าน"
                    isToggle
                    value={settings?.notifications ?? true}
                    onChange={(val) => handleToggleSetting("notifications", val)}
                  />

                  <SettingItem
                    icon={<Music className="w-5 h-5" />}
                    label="เพลง"
                    description="เปิดเพลง Lo-fi ขณะใช้งาน"
                    isToggle
                    value={settings?.musicEnabled ?? true}
                    onChange={(val) => handleToggleSetting("musicEnabled", val)}
                  />

                  <SettingItem
                    icon={<Moon className="w-5 h-5" />}
                    label="ธีม"
                    description="เลือกธีมสว่างหรือมืด"
                    value={settings?.theme === "dark" ? "มืด" : "สว่าง"}
                  />

                  <SettingItem
                    icon={<Globe className="w-5 h-5" />}
                    label="ภาษา"
                    description="เลือกภาษาที่ใช้ในแอป"
                    value={settings?.preferredLanguage === "en" ? "English" : "ไทย"}
                  />
                </div>
              )}
            </FolderCard>

            {/* About Card */}
            <FolderCard title="เกี่ยวกับแอป">
              <div className="space-y-1">
                <SettingItem
                  icon={<Smartphone className="w-5 h-5" />}
                  label="เวอร์ชัน"
                  value="1.0.0"
                />

                <SettingItem
                  icon={<HelpCircle className="w-5 h-5" />}
                  label="ช่วยเหลือ"
                />

                <SettingItem
                  icon={<Heart className="w-5 h-5 text-red-500" />}
                  label="สร้างโดย"
                  value="studyblog Team"
                />
              </div>
            </FolderCard>

            {/* Sign Out Button */}
            <motion.button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full p-4 rounded-xl border-2 flex items-center justify-center gap-3 font-kanit font-medium transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: isDark ? "#5C3A3A" : "#FFE4E4",
                borderColor: primaryColor,
                color: isDark ? "#FFFFFF" : "#1A1A1A",
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isSigningOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  ออกจากระบบ
                </>
              )}
            </motion.button>

            {/* Footer */}
            <p className="text-center font-kanit text-xs" style={{ color: textFaint }}>
              © 2025 studyblog - Academic Organizer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading: initLoading } = useInitializeUser();
  const [showMobileUtilities, setShowMobileUtilities] = useState(false);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginCard />;
  }

  if (initLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <TutorialOverlay />
      
      <MobileUtilities 
        isOpen={showMobileUtilities} 
        onClose={() => setShowMobileUtilities(false)} 
      />

      <MobileHeader 
        onUtilitiesClick={() => setShowMobileUtilities(true)}
      />
      
      <div className="pt-16 xl:pt-0">
        <SettingsDashboard />
      </div>
    </>
  );
}
