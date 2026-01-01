"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/layout";
import { FolderCard } from "@/components/ui";
import { ClockTimerWidget, IPodPlayer, MobileUtilities } from "@/components/widgets";
import { TutorialOverlay } from "@/components/tutorial";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useSchedule, useSubjects, useInitializeUser } from "@/hooks/useFirebaseData";
import { 
  Loader2,
  Plus,
  Clock,
  Music,
  Calendar,
  Trash2,
  X,
  GraduationCap,
  Settings
} from "lucide-react";
import Link from "next/link";

// Primary color
const primaryColor = "#00568C";

// Day labels
const dayLabels = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const shortDayLabels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

// Loading Screen
function LoadingScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: pageBg }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: cardBg, border: `3px solid ${primaryColor}` }}
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

// Schedule Dashboard
function ScheduleDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { subjects } = useSubjects();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const { schedule, loading, addScheduleItem, removeScheduleItem } = useSchedule();
  const [showAddModal, setShowAddModal] = useState(false);

  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const hoverBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  // Filter schedule by selected day
  const daySchedule = schedule.filter(item => item.dayOfWeek === selectedDay);

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <Navbar />

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6">
          {/* Left Sidebar - iPod & Clock (Desktop only) */}
          <div className="hidden xl:flex flex-col gap-6">
            <IPodPlayer />
            <ClockTimerWidget size={180} />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <FolderCard title="ตารางเรียน">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
                <p className="font-kanit" style={{ color: textMuted }}>
                  จัดการตารางเรียนของคุณ
                </p>
              </div>
            </FolderCard>

            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dayLabels.map((day, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl font-kanit text-sm border-2 transition-all"
                  style={{
                    backgroundColor: selectedDay === index ? primaryColor : cardBg,
                    borderColor: primaryColor,
                    color: selectedDay === index ? "#FFFFFF" : textColor,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{shortDayLabels[index]}</span>
                </motion.button>
              ))}
            </div>

            {/* Schedule List */}
            <FolderCard 
              title={`วัน${dayLabels[selectedDay]}`}
              headerAction={
                <motion.button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg font-kanit text-sm text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </motion.button>
              }
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                </div>
              ) : daySchedule.length > 0 ? (
                <div className="space-y-3">
                  {daySchedule.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ backgroundColor: isDark ? "#3D3D3D" : "#F8F8F8" }}
                    >
                      {/* Time */}
                      <div className="text-center min-w-[60px]">
                        <p className="font-mono text-sm font-bold" style={{ color: primaryColor }}>
                          {item.startTime}
                        </p>
                        <p className="font-mono text-xs" style={{ color: textMuted }}>
                          {item.endTime}
                        </p>
                      </div>

                      {/* Divider */}
                      <div 
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />

                      {/* Subject Info */}
                      <div className="flex-1">
                        <p className="font-kanit font-medium" style={{ color: textColor }}>
                          {item.subjectName}
                        </p>
                        {item.room && (
                          <p className="font-kanit text-xs" style={{ color: textMuted }}>
                            ห้อง: {item.room}
                          </p>
                        )}
                        {item.teacher && (
                          <p className="font-kanit text-xs" style={{ color: textMuted }}>
                            อาจารย์: {item.teacher}
                          </p>
                        )}
                      </div>

                      {/* Delete */}
                      <motion.button
                        onClick={() => removeScheduleItem(item.id)}
                        className="p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                        style={{ color: textMuted }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-2" style={{ color: textMuted }} />
                  <p className="font-kanit text-sm" style={{ color: textMuted }}>
                    ไม่มีคาบเรียนในวันนี้
                  </p>
                </div>
              )}

              {/* Add button */}
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="w-full mt-4 p-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors"
                style={{ borderColor: primaryColor, color: primaryColor }}
                whileHover={{ backgroundColor: hoverBg }}
              >
                <Plus className="w-5 h-5" />
                <span className="font-kanit text-sm">เพิ่มคาบเรียน</span>
              </motion.button>
            </FolderCard>
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      <AddScheduleModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addScheduleItem}
        subjects={subjects}
        selectedDay={selectedDay}
      />
    </div>
  );
}

// Add Schedule Modal
function AddScheduleModal({ 
  isOpen, 
  onClose, 
  onAdd,
  subjects,
  selectedDay
}: { 
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    subjectId: string;
    subjectName: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string;
    teacher?: string;
  }) => Promise<void>;
  subjects: Array<{ id: string; name: string }>;
  selectedDay: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [subjectId, setSubjectId] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [room, setRoom] = useState("");
  const [teacher, setTeacher] = useState("");
  const [saving, setSaving] = useState(false);

  const backdropBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
  const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";

  const handleSubmit = async () => {
    const subjectName = subjectId 
      ? subjects.find(s => s.id === subjectId)?.name || customSubject
      : customSubject;
    
    if (!subjectName.trim() || !startTime || !endTime) return;
    
    setSaving(true);
    try {
      await onAdd({
        subjectId: subjectId || "",
        subjectName: subjectName.trim(),
        dayOfWeek: selectedDay,
        startTime,
        endTime,
        room: room.trim() || undefined,
        teacher: teacher.trim() || undefined,
      });

      // Reset form
      setSubjectId("");
      setCustomSubject("");
      setStartTime("08:00");
      setEndTime("09:00");
      setRoom("");
      setTeacher("");
      onClose();
    } catch (error) {
      console.error("Failed to add schedule:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0" style={{ backgroundColor: backdropBg }} />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md z-10 rounded-2xl border-2 p-6"
            style={{ backgroundColor: modalBg, borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors"
              style={{ color: textMuted }}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-felipa text-2xl mb-4" style={{ color: primaryColor }}>
              เพิ่มคาบเรียน - วัน{dayLabels[selectedDay]}
            </h3>

            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  วิชา
                </label>
                {subjects.length > 0 ? (
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                    style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  >
                    <option value="">-- เลือกวิชา หรือพิมพ์ด้านล่าง --</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => {
                    setCustomSubject(e.target.value);
                    setSubjectId("");
                  }}
                  placeholder="หรือพิมพ์ชื่อวิชาใหม่..."
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none mt-2"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                    เริ่ม
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 font-mono focus:outline-none"
                    style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  />
                </div>
                <div>
                  <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                    สิ้นสุด
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 font-mono focus:outline-none"
                    style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  />
                </div>
              </div>

              {/* Room */}
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  ห้องเรียน (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="เช่น 301, ตึก A"
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                />
              </div>

              {/* Teacher */}
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  อาจารย์ผู้สอน (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="เช่น อ.สมชาย"
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                />
              </div>

              <motion.button
                onClick={handleSubmit}
                disabled={(!subjectId && !customSubject.trim()) || !startTime || !endTime || saving}
                className="w-full py-3 rounded-xl border-2 font-kanit font-medium flex items-center justify-center gap-2"
                style={{
                  backgroundColor: primaryColor,
                  borderColor,
                  color: "#FFFFFF",
                  opacity: ((!subjectId && !customSubject.trim()) || !startTime || !endTime || saving) ? 0.5 : 1
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    เพิ่มคาบเรียน
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SchedulePage() {
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
        <ScheduleDashboard />
      </div>
    </>
  );
}
