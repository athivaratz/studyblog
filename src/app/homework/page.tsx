"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DesktopLayout, Navbar } from "@/components/layout";
import { PaperCard, RetroButton, ConfirmDialog } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
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

export default function HomeworkPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; homeworkId: string | null }>({ show: false, homeworkId: null });

  const bgColor = isDark ? "#1A1A1A" : "#FFF8E7";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const textSubtle = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const textFaint = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#1A1A1A";
  const borderMuted = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";

  const bgColors: Record<string, string> = {
    yellow: isDark ? "#4D4A2A" : "#FFF3B0",
    pink: isDark ? "#5C3A42" : "#FFD6E0",
    blue: isDark ? "#2A3A4D" : "#C5E8FF",
    green: isDark ? "#2A4D2A" : "#D4F5D4",
    purple: isDark ? "#3D2A4D" : "#E8D5F2",
    orange: isDark ? "#4D3A2A" : "#FFE4C9",
  };

  const colorIndicators: Record<string, string> = {
    yellow: "#FFF3B0",
    pink: "#FFD6E0",
    blue: "#C5E8FF",
    green: "#D4F5D4",
    purple: "#E8D5F2",
    orange: "#FFE4C9",
  };

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
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

  const getItemBg = (item: { completed: boolean; dueDate: Date }) => {
    const isOverdue = !item.completed && item.dueDate < new Date();
    const isUrgent = !item.completed && item.dueDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    if (item.completed) return isDark ? "rgba(42, 77, 42, 0.5)" : "rgba(212, 245, 212, 0.5)";
    if (isOverdue) return isDark ? "rgba(153, 27, 27, 0.3)" : "#FEE2E2";
    if (isUrgent) return bgColors.pink;
    return cardBg;
  };

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
              <h2 className="font-felipa text-3xl flex items-center gap-2" style={{ color: textColor }}>
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
                className="p-4 rounded-xl border-2 text-center transition-all cursor-pointer"
                style={{
                  borderColor: filter === "all" ? borderColor : borderMuted,
                  backgroundColor: filter === "all" ? bgColors.yellow : "transparent"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-felipa text-2xl" style={{ color: textColor }}>{pendingHomework.length + completedHomework.length}</p>
                <p className="font-kanit text-xs" style={{ color: textMuted }}>ทั้งหมด</p>
              </motion.button>

              <motion.button
                onClick={() => setFilter("pending")}
                className="p-4 rounded-xl border-2 text-center transition-all cursor-pointer"
                style={{
                  borderColor: filter === "pending" ? borderColor : borderMuted,
                  backgroundColor: filter === "pending" ? bgColors.blue : "transparent"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-felipa text-2xl" style={{ color: textColor }}>{pendingHomework.length}</p>
                <p className="font-kanit text-xs" style={{ color: textMuted }}>รอส่ง</p>
              </motion.button>

              <motion.button
                onClick={() => setFilter("urgent")}
                className="p-4 rounded-xl border-2 text-center transition-all cursor-pointer"
                style={{
                  borderColor: filter === "urgent" ? borderColor : borderMuted,
                  backgroundColor: filter === "urgent" ? bgColors.pink : "transparent"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-felipa text-2xl text-red-500">{urgentHomework.length}</p>
                <p className="font-kanit text-xs" style={{ color: textMuted }}>เร่งด่วน</p>
              </motion.button>

              <motion.button
                onClick={() => setFilter("completed")}
                className="p-4 rounded-xl border-2 text-center transition-all cursor-pointer"
                style={{
                  borderColor: filter === "completed" ? borderColor : borderMuted,
                  backgroundColor: filter === "completed" ? bgColors.green : "transparent"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className="font-felipa text-2xl" style={{ color: isDark ? "#6EE7B7" : "#059669" }}>{completedHomework.length}</p>
                <p className="font-kanit text-xs" style={{ color: textMuted }}>เสร็จแล้ว</p>
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
                        className="flex items-center gap-4 p-4 rounded-xl border-2"
                        style={{
                          borderColor: borderColor,
                          backgroundColor: getItemBg(item)
                        }}
                      >
                        {/* Checkbox */}
                        <motion.button
                          onClick={() => completeHomeworkItem(item.id, !item.completed)}
                          className="flex-shrink-0 cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-6 h-6" style={{ color: isDark ? "#6EE7B7" : "#059669" }} />
                          ) : (
                            <Circle className="w-6 h-6" style={{ color: textFaint }} />
                          )}
                        </motion.button>

                        {/* Subject color indicator */}
                        <div
                          className="w-2 h-12 rounded-full border"
                          style={{
                            backgroundColor: colorIndicators[subject?.color || "yellow"],
                            borderColor: borderColor
                          }}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-kanit font-medium truncate ${item.completed ? "line-through" : ""}`}
                            style={{ color: item.completed ? textFaint : textColor }}
                          >
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs" style={{ color: textSubtle }}>
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
                          <div
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-kanit border-2"
                            style={{
                              borderColor: isDark ? "rgba(255,255,255,0.3)" : "#1A1A1A",
                              backgroundColor: isOverdue ? "#EF4444" : isUrgent ? "#FF6B6B" : bgColors.green,
                              color: isOverdue || isUrgent ? "#FFFFFF" : textColor
                            }}
                          >
                            {isUrgent && <AlertTriangle className="w-3 h-3" />}
                            {formatDueDate(item.dueDate)}
                          </div>
                        )}

                        {/* Delete button */}
                        <motion.button
                          onClick={() => setConfirmDelete({ show: true, homeworkId: item.id })}
                          className="p-2 rounded-full cursor-pointer hover:opacity-70"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: textFaint }} />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl">🎉</span>
                <h3 className="font-felipa text-2xl mt-4 mb-2" style={{ color: textColor }}>
                  {filter === "completed" ? "ยังไม่มีการบ้านที่เสร็จ" : "ไม่มีการบ้าน!"}
                </h3>
                <p className="font-kanit" style={{ color: textMuted }}>
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

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={confirmDelete.show}
          title="ลบการบ้าน?"
          message="คุณต้องการลบการบ้านนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
          confirmText="ลบ"
          cancelText="ยกเลิก"
          variant="danger"
          onConfirm={() => {
            if (confirmDelete.homeworkId) {
              removeHomework(confirmDelete.homeworkId);
            }
            setConfirmDelete({ show: false, homeworkId: null });
          }}
          onCancel={() => setConfirmDelete({ show: false, homeworkId: null })}
        />
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#1A1A1A";
  const inputBg = isDark ? "#1A1A1A" : "#FFFFFF";

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
          <h3 className="font-felipa text-2xl mb-4 text-center" style={{ color: textColor }}>📝 เพิ่มการบ้านใหม่</h3>

          {/* Title */}
          <div className="mb-4">
            <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>ชื่อการบ้าน</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น แบบฝึกหัดหน้า 42"
              className="w-full px-4 py-3 border-2 rounded-xl font-kanit focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              style={{ backgroundColor: inputBg, borderColor: borderColor, color: textColor }}
            />
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>วิชา</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl font-kanit focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              style={{ backgroundColor: inputBg, borderColor: borderColor, color: textColor }}
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
            <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>กำหนดส่ง</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl font-kanit focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              style={{ backgroundColor: inputBg, borderColor: borderColor, color: textColor }}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>รายละเอียด (ถ้ามี)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
              rows={3}
              className="w-full px-4 py-3 border-2 rounded-xl font-kanit focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
              style={{ backgroundColor: inputBg, borderColor: borderColor, color: textColor }}
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
