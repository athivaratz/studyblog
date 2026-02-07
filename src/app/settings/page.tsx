"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Navbar, MobileHeader, LoadingScreen } from "@/components/layout";
import { FolderCard } from "@/components/ui";
import { IPodPlayer, ClockTimerWidget, MobileUtilities } from "@/components/widgets";
import { TutorialOverlay, useTutorial } from "@/components/tutorial/TutorialOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, usePrimaryColor, useCustomColors } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginCard } from "@/components/auth";
import { useUserSettings } from "@/hooks/useFirebaseData";
import {
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
  Palette,
  X,
  Check,
  Sun,
} from "lucide-react";
import { useState } from "react";

// Preset theme colors
const presetThemes = [
  { name: "Ocean Blue", primary: "#00568C", accent: "#0080C0" },
  { name: "Forest Green", primary: "#16A34A", accent: "#22C55E" },
  { name: "Sunset Orange", primary: "#EA580C", accent: "#F97316" },
  { name: "Royal Purple", primary: "#7C3AED", accent: "#A855F7" },
  { name: "Rose Pink", primary: "#DB2777", accent: "#EC4899" },
  { name: "Midnight", primary: "#1E293B", accent: "#475569" },
];

// Custom Theme Modal
function CustomThemeModal({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: { primaryColor?: string; accentColor?: string; theme?: "light" | "dark" } | null;
  onSave: (colors: { primaryColor: string; accentColor: string; theme: "light" | "dark" }) => void;
}) {
  const { theme, setTheme } = useTheme();
  const { primaryColor, setPrimaryColor, setAccentColor } = useCustomColors();
  const isDark = theme === "dark";
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(currentSettings?.theme || theme);
  const [selectedPrimary, setSelectedPrimary] = useState(currentSettings?.primaryColor || primaryColor);
  const [selectedAccent, setSelectedAccent] = useState(currentSettings?.accentColor || "#0080C0");
  const [saving, setSaving] = useState(false);

  const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    // Update ThemeContext
    setTheme(selectedTheme);
    
    // Update CustomColorsContext (this also applies CSS variables)
    setPrimaryColor(selectedPrimary);
    setAccentColor(selectedAccent);
    
    // Save to Firestore
    await onSave({ primaryColor: selectedPrimary, accentColor: selectedAccent, theme: selectedTheme });
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md z-10 rounded-2xl border-2 p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: modalBg, borderColor: primaryColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-felipa text-2xl" style={{ color: textColor }}>
            ปรับแต่งธีม
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" style={{ color: textMuted }} />
          </button>
        </div>

        {/* Theme Mode Toggle */}
        <div className="mb-6">
          <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
            โหมดธีม
          </label>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setSelectedTheme("light")}
              className="flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2"
              style={{
                borderColor: selectedTheme === "light" ? primaryColor : "transparent",
                backgroundColor: selectedTheme === "light" ? `${primaryColor}20` : inputBg,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Sun className="w-5 h-5" style={{ color: selectedTheme === "light" ? primaryColor : textMuted }} />
              <span className="font-kanit text-sm" style={{ color: textColor }}>สว่าง</span>
            </motion.button>
            <motion.button
              onClick={() => setSelectedTheme("dark")}
              className="flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2"
              style={{
                borderColor: selectedTheme === "dark" ? primaryColor : "transparent",
                backgroundColor: selectedTheme === "dark" ? `${primaryColor}20` : inputBg,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Moon className="w-5 h-5" style={{ color: selectedTheme === "dark" ? primaryColor : textMuted }} />
              <span className="font-kanit text-sm" style={{ color: textColor }}>มืด</span>
            </motion.button>
          </div>
        </div>

        {/* Preset Themes */}
        <div className="mb-6">
          <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
            ธีมสำเร็จรูป
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presetThemes.map((preset) => (
              <motion.button
                key={preset.name}
                onClick={() => {
                  setSelectedPrimary(preset.primary);
                  setSelectedAccent(preset.accent);
                }}
                className="p-2 rounded-xl border-2 text-center relative"
                style={{
                  borderColor: selectedPrimary === preset.primary ? preset.primary : "transparent",
                  backgroundColor: inputBg,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-center gap-1 mb-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="font-kanit text-xs" style={{ color: textColor }}>
                  {preset.name}
                </span>
                {selectedPrimary === preset.primary && (
                  <div
                    className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: preset.primary }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
              สีหลัก
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedPrimary}
                onChange={(e) => setSelectedPrimary(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={selectedPrimary}
                onChange={(e) => setSelectedPrimary(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border-2 font-mono uppercase"
                style={{ backgroundColor: inputBg, borderColor: primaryColor, color: textColor }}
              />
            </div>
          </div>

          <div>
            <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
              สีรอง
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedAccent}
                onChange={(e) => setSelectedAccent(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={selectedAccent}
                onChange={(e) => setSelectedAccent(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border-2 font-mono uppercase"
                style={{ backgroundColor: inputBg, borderColor: primaryColor, color: textColor }}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
            ตัวอย่าง
          </label>
          <div
            className="p-4 rounded-xl border-2"
            style={{ borderColor: selectedPrimary, backgroundColor: inputBg }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: selectedPrimary }}
              >
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-kanit font-medium" style={{ color: textColor }}>
                  ตัวอย่างธีม
                </p>
                <p className="font-kanit text-xs" style={{ color: textMuted }}>
                  นี่คือลักษณะที่ธีมจะแสดง
                </p>
              </div>
            </div>
            <motion.button
              className="w-full py-2 rounded-lg font-kanit text-sm text-white"
              style={{ backgroundColor: selectedPrimary }}
            >
              ปุ่มตัวอย่าง
            </motion.button>
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl font-kanit font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: selectedPrimary }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              บันทึกธีม
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string | boolean;
  isToggle?: boolean;
  onChange?: (value: boolean) => void;
  onClick?: () => void;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const textFaint = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  const iconBg = isDark ? "#3D3D3D" : "#E8F4FF";
  const hoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  return (
    <motion.div
      onClick={isToggle ? undefined : onClick}
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

// Edit Profile Modal
function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentPhoto,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentPhoto: string;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const { updateProfile } = useAuth();
  const [name, setName] = useState(currentName);
  const [photoURL, setPhotoURL] = useState(currentPhoto);
  const [saving, setSaving] = useState(false);

  // Update effect when props change
  // Note: We use a key on the modal or useEffect to sync props to state if needed
  // But since we mount/unmount or just open, we can rely on initial state if it's conditional rendered
  // or use an effect.

  const backdropBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
  const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({
        displayName: name.trim(),
        photoURL: photoURL.trim() || null,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ backgroundColor: backdropBg }} />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md z-10 rounded-2xl border-2 p-6"
        style={{ backgroundColor: modalBg, borderColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-felipa text-2xl mb-4" style={{ color: primaryColor }}>
          แก้ไขโปรไฟล์
        </h3>

        <div className="space-y-4">
          <div>
            <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
              ชื่อที่แสดง
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
              style={{ backgroundColor: inputBg, borderColor, color: textColor }}
            />
          </div>

          <div>
            <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
              ลิงก์รูปโปรไฟล์ (URL)
            </label>
            <input
              type="text"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
              style={{ backgroundColor: inputBg, borderColor, color: textColor }}
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="w-full py-3 rounded-xl border-2 font-kanit font-medium flex items-center justify-center gap-2"
            style={{
              backgroundColor: primaryColor,
              borderColor,
              color: "#FFFFFF",
              opacity: (!name.trim() || saving) ? 0.5 : 1
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "บันทึก"
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Settings Dashboard
function SettingsDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const { language, setLanguage } = useLanguage();
  const isDark = theme === "dark";
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { resetTutorial } = useTutorial();

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
            <ClockTimerWidget id="tour-utils-desktop" size={180} />
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
                  onClick={() => setShowEditProfile(true)}
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
                    description="ปรับแต่งสีและธีมของแอป"
                    value={settings?.theme === "dark" ? "มืด" : "สว่าง"}
                    onClick={() => setShowThemeModal(true)}
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
                  label="แนะนำการใช้งาน (Tutorial)"
                  description="ดูวิธีการใช้งานเริ่มต้นใหม่อีกครั้ง"
                  onClick={resetTutorial}
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentName={userProfile?.displayName || user?.displayName || ""}
        currentPhoto={user?.photoURL || ""}
      />

      {/* Custom Theme Modal */}
      <CustomThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentSettings={{
          primaryColor: settings?.customColors?.primary || "#00568C",
          accentColor: settings?.customColors?.accent || "#0080C0",
          theme: (settings?.theme === "auto" ? "light" : settings?.theme) || "light",
        }}
        onSave={async (data) => {
          await updateSettings({
            theme: data.theme,
            customColors: {
              primary: data.primaryColor,
              accent: data.accentColor,
            },
          });
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [showMobileUtilities, setShowMobileUtilities] = useState(false);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginCard />;
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
