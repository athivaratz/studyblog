"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Save, Loader2, Clock, MapPin, Book } from "lucide-react";
import { PaperCard, RetroButton } from "@/components/ui";
import { useSubjects } from "@/hooks/useFirebaseData";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayOfWeek: number;
  onAdd: (data: any) => Promise<void>;
}

const dayNamesFull = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

export function AddScheduleModal({ isOpen, onClose, dayOfWeek, onAdd }: AddScheduleModalProps) {
  const { subjects } = useSubjects();
  const [subjectId, setSubjectId] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [room, setRoom] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    } catch (error) {
      console.error("Failed to add schedule:", error);
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />

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

              <h3 className="font-felipa text-2xl mb-6 dark:text-white">
                เพิ่มวิชาเรียน <span className="text-base font-kanit text-black/50 dark:text-white/50">วัน{dayNamesFull[dayOfWeek]}</span>
              </h3>

              <div className="space-y-4">
                {/* Subject Select */}
                <div className="space-y-1">
                  <label className="text-sm font-kanit text-black/60 dark:text-white/60 flex items-center gap-2">
                    <Book className="w-4 h-4" /> วิชา
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2 rounded-lg border-2 border-black/10 dark:border-white/10 bg-white dark:bg-[#2D2D2D] font-kanit focus:outline-none focus:border-[#FF6B6B]"
                  >
                    <option value="">เลือกวิชาเรียน...</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-kanit text-black/60 dark:text-white/60 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> เริ่ม
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2 rounded-lg border-2 border-black/10 dark:border-white/10 bg-white dark:bg-[#2D2D2D] font-kanit focus:outline-none focus:border-[#FF6B6B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-kanit text-black/60 dark:text-white/60 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> ถึง
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-2 rounded-lg border-2 border-black/10 dark:border-white/10 bg-white dark:bg-[#2D2D2D] font-kanit focus:outline-none focus:border-[#FF6B6B]"
                    />
                  </div>
                </div>

                {/* Room */}
                <div className="space-y-1">
                  <label className="text-sm font-kanit text-black/60 dark:text-white/60 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> ห้องเรียน
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="ระบุห้องเรียน (ถ้ามี)"
                    className="w-full p-2 rounded-lg border-2 border-black/10 dark:border-white/10 bg-white dark:bg-[#2D2D2D] font-kanit focus:outline-none focus:border-[#FF6B6B]"
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
