"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { 
  User, 
  X, 
  Camera,
  Save,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PaperCard, RetroButton } from "@/components/ui";
import { uploadProfilePhoto } from "@/lib/firebaseServices";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, userProfile, updateProfile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || "");
  const [studentId, setStudentId] = useState(userProfile?.studentId || "");
  const [school, setSchool] = useState(userProfile?.school || "studyblog Academy");
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("ไฟล์ต้องมีขนาดไม่เกิน 2MB");
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Upload
    setIsUploading(true);
    try {
      const downloadUrl = await uploadProfilePhoto(user.uid, file);
      await updateProfile({ photoURL: downloadUrl });
    } catch (error) {
      console.error("Failed to upload photo:", error);
      setPhotoPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Theme colors
  const backdropBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
  const hoverBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
  const borderColor = isDark ? "rgba(255,255,255,0.3)" : "#000000";
  const avatarBg = isDark ? "#3D3A2A" : "#FFF3B0";
  const textMuted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const labelColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const iconMuted = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({
        displayName,
        studentId,
        school,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: backdropBg }}
          />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <PaperCard color="white" className="p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full transition-colors"
                style={{ color: textColor }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverBg}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full border-3 overflow-hidden"
                    style={{ borderColor, backgroundColor: avatarBg }}
                  >
                    {(photoPreview || user?.photoURL) ? (
                      <img
                        src={photoPreview || user?.photoURL || ""}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12" style={{ color: iconMuted }} />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  <motion.button
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--primary)] border-2 rounded-full flex items-center justify-center"
                    style={{ borderColor: 'var(--primary-dark, rgba(0,0,0,0.3))' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
                <p className="mt-3 font-kanit text-sm" style={{ color: textMuted }}>
                  {user?.email}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="font-kanit text-sm mb-1 block" style={{ color: labelColor }}>
                    ชื่อที่แสดง
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ชื่อของคุณ"
                    className="w-full px-4 py-3 border-2 rounded-xl font-kanit focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}
                  />
                </div>

                <div>
                  <label className="font-kanit text-sm mb-1 block" style={{ color: labelColor }}>
                    รหัสนักเรียน
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="เช่น 12345"
                    className="w-full px-4 py-3 border-2 rounded-xl font-kanit focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}
                  />
                </div>

                <div>
                  <label className="font-kanit text-sm mb-1 block" style={{ color: labelColor }}>
                    โรงเรียน/มหาวิทยาลัย
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="ชื่อสถานศึกษา"
                    className="w-full px-4 py-3 border-2 rounded-xl font-kanit focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{ borderColor, backgroundColor: inputBg, color: textColor }}
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="mt-6">
                <RetroButton
                  color="green"
                  className="w-full"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      บันทึก
                    </>
                  )}
                </RetroButton>
              </div>
            </PaperCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
