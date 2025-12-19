"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  User, 
  X, 
  Camera,
  Save,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PaperCard, RetroButton } from "@/components/ui";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, userProfile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || "");
  const [studentId, setStudentId] = useState(userProfile?.studentId || "");
  const [school, setSchool] = useState(userProfile?.school || "Studygram Academy");
  const [isSaving, setIsSaving] = useState(false);

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
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

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
                className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-3 border-black dark:border-white/30 overflow-hidden bg-[#FFF3B0] dark:bg-[#3D3A2A]">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-black/30 dark:text-white/30" />
                      </div>
                    )}
                  </div>
                  <motion.button
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FF6B6B] border-2 border-black rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
                <p className="mt-3 font-kanit text-sm text-black/50 dark:text-white/50">
                  {user?.email}
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-1 block">
                    ชื่อที่แสดง
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ชื่อของคุณ"
                    className="w-full px-4 py-3 border-2 border-black dark:border-white/30 rounded-xl font-kanit bg-white dark:bg-[#2D2D2D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>

                <div>
                  <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-1 block">
                    รหัสนักเรียน
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="เช่น 12345"
                    className="w-full px-4 py-3 border-2 border-black dark:border-white/30 rounded-xl font-kanit bg-white dark:bg-[#2D2D2D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                  />
                </div>

                <div>
                  <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-1 block">
                    โรงเรียน/มหาวิทยาลัย
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="ชื่อสถานศึกษา"
                    className="w-full px-4 py-3 border-2 border-black dark:border-white/30 rounded-xl font-kanit bg-white dark:bg-[#2D2D2D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
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
