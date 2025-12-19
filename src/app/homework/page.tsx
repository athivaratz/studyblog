"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DesktopLayout, Navbar } from "@/components/layout";
import { PaperCard, RetroButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCard } from "@/components/auth";
import { useHomework, useSubjects } from "@/hooks/useFirebaseData";
import { 
  ClipboardList, 
  Plus,
  Loader2,
  Calendar,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { useState } from "react";

const bgColors: Record<string, string> = {
  yellow: "bg-[#FFF3B0]",
  pink: "bg-[#FFD6E0]",
  blue: "bg-[#C5E8FF]",
  green: "bg-[#D4F5D4]",
  purple: "bg-[#E8D5F2]",
  orange: "bg-[#FFE4C9]",
};

export default function HomeworkPage() {
  const { user, loading: authLoading } = useAuth();
  const { 
    pendingHomework, 
    completedHomework, 
    urgentHomework,
    loading: homeworkLoading,
    completeHomeworkItem,
    removeHomework,
    addHomework
  } = useHomework();
  const { subjects } = useSubjects();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "urgent" | "completed">("all");

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

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "เลยกำหนด";
    if (days === 0) return "วันนี้";
    if (days === 1) return "พรุ่งนี้";
    return `${days} วัน`;
  };

  const getFilteredHomework = () => {
    switch (filter) {
      case "pending":
        return pendingHomework;
      case "urgent":
        return urgentHomework;
      case "completed":
        return completedHomework;
      default:
        return [...pendingHomework, ...completedHomework];
    }
  };

  const filteredHomework = getFilteredHomework();

  return (
    <DesktopLayout>
      <div className="space-y-6">
        <Navbar />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PaperCard color="white" className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-felipa text-3xl flex items-center gap-2">
                <ClipboardList className="w-7 h-7 text-[#FF6B6B]" />
                การบ้านทั้งหมด
              </h2>
              <RetroButton 
                color="pink" 
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มการบ้าน
              </RetroButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <motion.button
                onClick={() => setFilter("all")}
                className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  filter === "all" ? "border-black dark:border-white bg-[#FFF3B0] dark:bg-[#4D4A2A]" : "border-black/20 dark:border-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-felipa text-2xl dark:text-white">{pendingHomework.length + completedHomework.length}</p>
                <p className="font-kanit text-xs text-black/60 dark:text-white/60">ทั้งหมด</p>
              </motion.button>
              
              <motion.button
                onClick={() => setFilter("pending")}
                className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  filter === "pending" ? "border-black dark:border-white bg-[#C5E8FF] dark:bg-[#2A3A4D]" : "border-black/20 dark:border-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-felipa text-2xl dark:text-white">{pendingHomework.length}</p>
                <p className="font-kanit text-xs text-black/60 dark:text-white/60">รอส่ง</p>
              </motion.button>

              <motion.button
                onClick={() => setFilter("urgent")}
                className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  filter === "urgent" ? "border-black dark:border-white bg-[#FFD6E0] dark:bg-[#5C3A42]" : "border-black/20 dark:border-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-felipa text-2xl text-red-500">{urgentHomework.length}</p>
                <p className="font-kanit text-xs text-black/60 dark:text-white/60">เร่งด่วน</p>
              </motion.button>

              <motion.button
                onClick={() => setFilter("completed")}
                className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  filter === "completed" ? "border-black dark:border-white bg-[#D4F5D4] dark:bg-[#2A4D2A]" : "border-black/20 dark:border-white/20"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-felipa text-2xl text-green-600 dark:text-green-400">{completedHomework.length}</p>
                <p className="font-kanit text-xs text-black/60 dark:text-white/60">เสร็จแล้ว</p>
              </motion.button>
            </div>

            {/* Homework List */}
            {homeworkLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
              </div>
            ) : filteredHomework.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredHomework.map((item, index) => {
                    const subject = subjects.find(s => s.id === item.subjectId);
                    const isUrgent = !item.completed && item.dueDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
                    const isOverdue = !item.completed && item.dueDate < new Date();

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          flex items-center gap-4 p-4 rounded-xl border-2 border-black dark:border-white/20
                          ${item.completed 
                            ? "bg-[#D4F5D4]/50 dark:bg-[#2A4D2A]/50" 
                            : isOverdue
                            ? "bg-red-100 dark:bg-red-900/30"
                            : isUrgent 
                            ? "bg-[#FFD6E0] dark:bg-[#5C3A42]" 
                            : "bg-white dark:bg-[#2D2D2D]"
                          }
                        `}
                      >
                        {/* Checkbox */}
                        <motion.button
                          onClick={() => completeHomeworkItem(item.id, !item.completed)}
                          className="flex-shrink-0 cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60" />
                          )}
                        </motion.button>

                        {/* Subject color indicator */}
                        <div
                          className={`w-2 h-12 rounded-full ${bgColors[subject?.color || "yellow"]} border border-black dark:border-white/20`}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-kanit font-medium truncate ${item.completed ? "line-through text-black/40 dark:text-white/40" : "dark:text-white"}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                            <span>{subject?.name || "ไม่ระบุวิชา"}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{item.dueDate.toLocaleDateString("th-TH")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Due date badge */}
                        {!item.completed && (
                          <div className={`
                            flex items-center gap-1 px-3 py-1 rounded-full text-xs font-kanit
                            border-2 border-black dark:border-white/30
                            ${isOverdue 
                              ? "bg-red-500 text-white" 
                              : isUrgent 
                              ? "bg-[#FF6B6B] text-white" 
                              : "bg-[#D4F5D4] dark:bg-[#2A4D2A] dark:text-white"
                            }
                          `}>
                            {isUrgent && <AlertTriangle className="w-3 h-3" />}
                            {formatDueDate(item.dueDate)}
                          </div>
                        )}

                        {/* Delete button */}
                        <motion.button
                          onClick={() => removeHomework(item.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4 text-black/30 dark:text-white/30 hover:text-red-500" />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl">🎉</span>
                <h3 className="font-felipa text-2xl mt-4 mb-2 dark:text-white">
                  {filter === "completed" ? "ยังไม่มีการบ้านที่เสร็จ" : "ไม่มีการบ้าน!"}
                </h3>
                <p className="font-kanit text-black/60 dark:text-white/60">
                  {filter === "completed" 
                    ? "ทำการบ้านเสร็จแล้วจะแสดงที่นี่" 
                    : "เยี่ยมมาก! คุณทำการบ้านครบหมดแล้ว"
                  }
                </p>
              </div>
            )}
          </PaperCard>
        </motion.div>

        {/* Add Homework Modal */}
        {showAddModal && (
          <AddHomeworkModal
            subjects={subjects}
            onClose={() => setShowAddModal(false)}
            onAdd={async (data) => {
              await addHomework({
                ...data,
                urgent: data.dueDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
              });
              setShowAddModal(false);
            }}
          />
        )}
      </div>
    </DesktopLayout>
  );
}

function AddHomeworkModal({
  subjects,
  onClose,
  onAdd,
}: {
  subjects: Array<{ id: string; name: string; color: string }>;
  onClose: () => void;
  onAdd: (data: { title: string; subjectId: string; dueDate: Date; description?: string; urgent?: boolean }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !subjectId || !dueDate) return;
    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        subjectId,
        dueDate: new Date(dueDate),
        description: description.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <PaperCard color="white" className="p-6">
          <h3 className="font-felipa text-2xl mb-4 text-center dark:text-white">📝 เพิ่มการบ้านใหม่</h3>

          {/* Title */}
          <div className="mb-4">
            <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-1 block">ชื่อการบ้าน</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น แบบฝึกหัดหน้า 42"
              className="w-full px-4 py-3 border-2 border-black dark:border-white/20 rounded-xl font-kanit bg-white dark:bg-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            />
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-1 block">วิชา</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black dark:border-white/20 rounded-xl font-kanit bg-white dark:bg-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            >
              {subjects.length === 0 ? (
                <option value="">กรุณาเพิ่มวิชาก่อน</option>
              ) : (
                subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-1 block">กำหนดส่ง</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black dark:border-white/20 rounded-xl font-kanit bg-white dark:bg-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-1 block">รายละเอียด (ถ้ามี)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-black dark:border-white/20 rounded-xl font-kanit bg-white dark:bg-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <RetroButton color="white" className="flex-1" onClick={onClose}>
              ยกเลิก
            </RetroButton>
            <RetroButton
              color="pink"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!title.trim() || !subjectId || !dueDate || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "เพิ่มการบ้าน"
              )}
            </RetroButton>
          </div>
        </PaperCard>
      </motion.div>
    </motion.div>
  );
}
