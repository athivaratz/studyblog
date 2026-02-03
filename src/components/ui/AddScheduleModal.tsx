"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Save, Loader2, Clock, MapPin, Book, Plus } from "lucide-react";
import { PaperCard, RetroButton } from "@/components/ui";
import { useSubjects } from "@/hooks/useFirebaseData";
import { useTheme } from "@/contexts/ThemeContext";

interface ScheduleFormData {
  subjectId: string;
  subjectName?: string;
  startTime: string;
  endTime: string;
  room?: string;
  teacher?: string;
  dayOfWeek: number;
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayOfWeek: number;
  onAdd: (data: ScheduleFormData) => Promise<void>;
}

const dayNamesFull = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

const colorOptions = [
  { value: "yellow", label: "เหลือง", color: "#FFF3B0" },
  { value: "pink", label: "ชมพู", color: "#FFD6E0" },
  { value: "blue", label: "ฟ้า", color: "#C5E8FF" },
  { value: "green", label: "เขียว", color: "#D4F5D4" },
  { value: "purple", label: "ม่วง", color: "#E8D5F2" },
  { value: "orange", label: "ส้ม", color: "#FFE4C9" },
];

const iconOptions = [
  { value: "calculator", label: "คณิต" },
  { value: "flask", label: "วิทย์" },
  { value: "globe", label: "ภาษา" },
  { value: "book", label: "หนังสือ" },
  { value: "palette", label: "ศิลปะ" },
  { value: "music", label: "ดนตรี" },
];

export function AddScheduleModal({ isOpen, onClose, dayOfWeek, onAdd }: AddScheduleModalProps) {
  const { subjects, addSubject } = useSubjects();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [subjectId, setSubjectId] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [room, setRoom] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // New subject form
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState("blue");
  const [newSubjectIcon, setNewSubjectIcon] = useState("book");
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // Theme colors
  const backdropBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
  const hoverBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const labelColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const subtextColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const inputBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const handleSave = async () => {
    if (!subjectId) return;
    
    setIsSaving(true);
    try {
      await onAdd({
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      });
      onClose();
      // Reset form
      setSubjectId("");
      setStartTime("08:00");
      setEndTime("09:00");
      setRoom("");
      setShowNewSubjectForm(false);
    } catch (error) {
      console.error("Failed to add schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewSubject = async () => {
    if (!newSubjectName.trim()) return;
    
    setIsAddingSubject(true);
    try {
      const newId = await addSubject({
        name: newSubjectName.trim(),
        color: newSubjectColor,
        icon: newSubjectIcon,
        order: subjects.length,
      });
      // Auto-select the new subject
      setSubjectId(newId);
      setShowNewSubjectForm(false);
      setNewSubjectName("");
      setNewSubjectColor("blue");
      setNewSubjectIcon("book");
    } catch (error) {
      console.error("Failed to add subject:", error);
    } finally {
      setIsAddingSubject(false);
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
        >
          <div 
            className="absolute inset-0 backdrop-blur-sm" 
            style={{ backgroundColor: backdropBg }}
            onClick={onClose} 
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

              <h3 className="font-felipa text-2xl mb-6" style={{ color: textColor }}>
                เพิ่มวิชาเรียน <span className="text-base font-kanit" style={{ color: subtextColor }}>วัน{dayNamesFull[dayOfWeek]}</span>
              </h3>

              <div className="space-y-4">
                {/* Subject Select */}
                <div className="space-y-1">
                  <label className="text-sm font-kanit flex items-center gap-2" style={{ color: labelColor }}>
                    <Book className="w-4 h-4" /> วิชา
                  </label>
                  
                  {!showNewSubjectForm ? (
                    <>
                      <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className="w-full p-2 rounded-lg border-2 font-kanit focus:outline-none focus:border-[#00568C]"
                        style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textColor }}
                      >
                        <option value="">เลือกวิชาเรียน...</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                      
                      <motion.button
                        onClick={() => setShowNewSubjectForm(true)}
                        className="w-full mt-2 p-2 rounded-lg border-2 border-dashed font-kanit text-sm flex items-center justify-center gap-2"
                        style={{ borderColor: "#00568C", color: "#00568C" }}
                        whileHover={{ backgroundColor: "rgba(0,86,140,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="w-4 h-4" />
                        เพิ่มวิชาใหม่
                      </motion.button>
                    </>
                  ) : (
                    <div className="space-y-3 p-3 rounded-lg border-2" style={{ borderColor: "#00568C", backgroundColor: isDark ? "#1A3A4D" : "#E8F4FF" }}>
                      <input
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="ชื่อวิชา"
                        className="w-full p-2 rounded-lg border-2 font-kanit focus:outline-none focus:border-[#00568C]"
                        style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textColor }}
                      />
                      
                      {/* Color picker */}
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((c) => (
                          <motion.button
                            key={c.value}
                            onClick={() => setNewSubjectColor(c.value)}
                            className="w-8 h-8 rounded-full border-2"
                            style={{ 
                              backgroundColor: c.color, 
                              borderColor: newSubjectColor === c.value ? "#00568C" : "transparent",
                              boxShadow: newSubjectColor === c.value ? "0 0 0 2px #00568C" : "none"
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          />
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <motion.button
                          onClick={handleAddNewSubject}
                          disabled={!newSubjectName.trim() || isAddingSubject}
                          className="flex-1 p-2 rounded-lg text-white font-kanit text-sm flex items-center justify-center gap-2"
                          style={{ backgroundColor: newSubjectName.trim() ? "#00568C" : "#999" }}
                          whileHover={{ scale: newSubjectName.trim() ? 1.02 : 1 }}
                          whileTap={{ scale: newSubjectName.trim() ? 0.98 : 1 }}
                        >
                          {isAddingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          เพิ่ม
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setShowNewSubjectForm(false);
                            setNewSubjectName("");
                          }}
                          className="px-4 py-2 rounded-lg font-kanit text-sm"
                          style={{ backgroundColor: isDark ? "#3D3D3D" : "#E0E0E0", color: textColor }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          ยกเลิก
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-kanit flex items-center gap-2" style={{ color: labelColor }}>
                      <Clock className="w-4 h-4" /> เริ่ม
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2 rounded-lg border-2 font-kanit focus:outline-none focus:border-[#FF6B6B]"
                      style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textColor }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-kanit flex items-center gap-2" style={{ color: labelColor }}>
                      <Clock className="w-4 h-4" /> ถึง
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-2 rounded-lg border-2 font-kanit focus:outline-none focus:border-[#FF6B6B]"
                      style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textColor }}
                    />
                  </div>
                </div>

                {/* Room */}
                <div className="space-y-1">
                  <label className="text-sm font-kanit flex items-center gap-2" style={{ color: labelColor }}>
                    <MapPin className="w-4 h-4" /> ห้องเรียน
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="ระบุห้องเรียน (ถ้ามี)"
                    className="w-full p-2 rounded-lg border-2 font-kanit focus:outline-none focus:border-[#FF6B6B]"
                    style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textColor }}
                  />
                </div>

                <div className="pt-4">
                  <RetroButton
                    onClick={handleSave}
                    disabled={!subjectId || isSaving}
                    className="w-full justify-center"
                    color="green"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" /> บันทึก
                      </span>
                    )}
                  </RetroButton>
                </div>
              </div>
            </PaperCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
