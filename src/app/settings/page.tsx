"use client";

import { motion } from "framer-motion";
import { DesktopLayout, Navbar } from "@/components/layout";
import { PaperCard, RetroButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCard } from "@/components/auth";
import { useUserSettings } from "@/hooks/useFirebaseData";
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
  Heart
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] dark:bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
      </div>
    );
  }

  if (!user) {
    return <LoginCard />;
  }

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
    <DesktopLayout>
      <div className="space-y-6">
        <Navbar />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Profile Card */}
          <PaperCard color="white" className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-black dark:border-white/20 overflow-hidden bg-[#FFF3B0] dark:bg-[#3D3A2A]">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "Profile"} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-black/30 dark:text-white/30" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-felipa text-2xl dark:text-white">{userProfile?.displayName || user.displayName || "นักเรียน"}</h2>
                <p className="font-kanit text-sm text-black/60 dark:text-white/60">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-[#D4F5D4] dark:bg-[#2A4D2A] border border-black dark:border-white/20 rounded-full text-xs font-kanit dark:text-white">
                    ✅ บัญชี Google
                  </span>
                </div>
              </div>
              <RetroButton color="blue" size="sm">
                แก้ไข
              </RetroButton>
            </div>
          </PaperCard>

          {/* Settings */}
          <PaperCard color="white" className="p-6">
            <h3 className="font-felipa text-xl mb-4 flex items-center gap-2 dark:text-white">
              <SettingsIcon className="w-5 h-5" />
              การตั้งค่า
            </h3>

            {settingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Notifications */}
                <SettingItem
                  icon={<Bell className="w-5 h-5" />}
                  label="การแจ้งเตือน"
                  description="รับการแจ้งเตือนเมื่อถึงกำหนดส่งการบ้าน"
                  isToggle
                  value={settings?.notifications ?? true}
                  onChange={(val) => handleToggleSetting("notifications", val)}
                />

                {/* Music */}
                <SettingItem
                  icon={<Music className="w-5 h-5" />}
                  label="เพลง"
                  description="เปิดเพลง Lo-fi ขณะใช้งาน"
                  isToggle
                  value={settings?.musicEnabled ?? true}
                  onChange={(val) => handleToggleSetting("musicEnabled", val)}
                />

                {/* Theme */}
                <SettingItem
                  icon={<Moon className="w-5 h-5" />}
                  label="ธีม"
                  description="เลือกธีมสว่างหรือมืด"
                  value={settings?.theme === "dark" ? "มืด" : "สว่าง"}
                />

                {/* Language */}
                <SettingItem
                  icon={<Globe className="w-5 h-5" />}
                  label="ภาษา"
                  description="เลือกภาษาที่ใช้ในแอป"
                  value={settings?.preferredLanguage === "en" ? "English" : "ไทย"}
                />
              </div>
            )}
          </PaperCard>

          {/* App Info */}
          <PaperCard color="cream" className="p-6">
            <h3 className="font-felipa text-xl mb-4 dark:text-white">เกี่ยวกับแอป</h3>

            <div className="space-y-2">
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
                value="Studygram Team"
              />
            </div>
          </PaperCard>

          {/* Sign Out */}
          <motion.button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="
              w-full p-4 bg-[#FFD6E0] dark:bg-[#5C3A42] border-2 border-black dark:border-white/20 rounded-2xl
              flex items-center justify-center gap-3
              font-kanit font-medium dark:text-white
              shadow-hard dark:shadow-none
              hover:bg-[#FFB8C8] dark:hover:bg-[#6C4A52] transition-colors
              disabled:opacity-50 cursor-pointer
            "
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
          <p className="text-center font-kanit text-xs text-black/40 dark:text-white/40">
            © 2024 Studygram - Y2K Academic Aesthetic
          </p>
        </motion.div>
      </div>
    </DesktopLayout>
  );
}

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
  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
      whileHover={{ x: 4 }}
    >
      <div className="w-10 h-10 bg-[#FFF3B0] dark:bg-[#3D3A2A] border-2 border-black dark:border-white/20 rounded-xl flex items-center justify-center dark:text-white">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-kanit font-medium dark:text-white">{label}</p>
        {description && (
          <p className="font-kanit text-xs text-black/50 dark:text-white/50">{description}</p>
        )}
      </div>
      {isToggle ? (
        <motion.button
          onClick={() => onChange?.(!value)}
          className={`
            w-12 h-7 rounded-full border-2 border-black dark:border-white/30 p-0.5 transition-colors cursor-pointer
            ${value ? "bg-[#4ECDC4]" : "bg-gray-200 dark:bg-gray-600"}
          `}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full border border-black dark:border-white/30"
            animate={{ x: value ? 18 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
      ) : value ? (
        <span className="font-kanit text-sm text-black/50 dark:text-white/50">{value}</span>
      ) : (
        <ChevronRight className="w-5 h-5 text-black/30 dark:text-white/30" />
      )}
    </motion.div>
  );
}
