"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Navbar, MobileHeader, LoadingScreen } from "@/components/layout";
import { FolderCard, ConfirmDialog } from "@/components/ui";
import { ClockTimerWidget, IPodPlayer, MobileUtilities } from "@/components/widgets";
import { TutorialOverlay } from "@/components/tutorial";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useTodos, useSubjects } from "@/hooks/useFirebaseData";
import { formatDueDate } from "@/lib/utils";
import {
  Loader2,
  Plus,
  ChevronDown,
  Check,
  Trash2,
  AlertCircle,
  Book,
  UserCircle,
  Circle,
  X,
  CheckSquare,
  Filter
} from "lucide-react";

// Category labels
const categoryLabels = {
  all: "ทั้งหมด",
  homework: "การบ้าน",
  personal: "ส่วนตัว",
  other: "อื่นๆ",
};


// Todo List Full Page
function TodoFullPage() {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const { subjects } = useSubjects();
  const {
    todos,
    pendingTodos,
    loading,
    addTodo,
    toggleTodo,
    removeTodo
  } = useTodos();

  const [filter, setFilter] = useState<"all" | "homework" | "personal" | "other">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Theme colors
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const textFaint = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const borderColor = primaryColor;
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const dropdownBg = isDark ? "#3D3D3D" : "#FFFFFF";
  const hoverBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";

  // Filter todos
  const filteredTodos = filter === "all"
    ? todos
    : todos.filter(t => t.category === filter);

  const pendingFiltered = filteredTodos.filter(t => !t.completed);
  const completedFiltered = filteredTodos.filter(t => t.completed);

  const categoryColors = {
    homework: isDark ? "#00568C" : "#C5E8FF",
    personal: isDark ? "#2A4D2A" : "#D4F5D4",
    other: isDark ? "#4D3A2A" : "#FFE4C9",
  };

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
            <FolderCard title="รายการ To-Do">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" style={{ color: primaryColor }} />
                <p className="font-kanit" style={{ color: textMuted }}>
                  คุณมี <span className="font-bold" style={{ color: primaryColor }}>{pendingTodos.length}</span> รายการที่ต้องทำ
                </p>
              </div>
            </FolderCard>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((key) => (
                <motion.button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl font-kanit text-sm border-2 transition-all"
                  style={{
                    backgroundColor: filter === key ? primaryColor : cardBg,
                    borderColor: primaryColor,
                    color: filter === key ? "#FFFFFF" : textColor,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {key === "all" && <Filter className="w-4 h-4" />}
                  {key === "homework" && <Book className="w-4 h-4" />}
                  {key === "personal" && <UserCircle className="w-4 h-4" />}
                  {key === "other" && <Circle className="w-4 h-4" />}
                  {categoryLabels[key]}
                </motion.button>
              ))}
            </div>

            {/* Pending Todo List */}
            <FolderCard title="รอดำเนินการ">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                </div>
              ) : pendingFiltered.length > 0 ? (
                <div className="space-y-2">
                  {pendingFiltered.map((todo, index) => {
                    const dueInfo = formatDueDate(todo.dueDate);
                    const catColor = categoryColors[todo.category];

                    return (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: isDark ? "#3D3D3D" : "#F8F8F8" }}
                      >
                        <motion.button
                          onClick={() => toggleTodo(todo.id, true)}
                          className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: primaryColor }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Circle className="w-4 h-4" style={{ color: textFaint }} />
                        </motion.button>

                        <div className="flex-1 min-w-0">
                          <p className="font-kanit text-sm font-medium" style={{ color: textColor }}>
                            {todo.text}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className="font-kanit text-[10px] px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: catColor, color: textColor }}
                            >
                              {todo.subjectName || categoryLabels[todo.category]}
                            </span>
                            {dueInfo && (
                              <span
                                className="font-kanit text-[10px] flex items-center gap-1"
                                style={{ color: dueInfo.urgent ? "#FF6B6B" : textMuted }}
                              >
                                {dueInfo.urgent && <AlertCircle className="w-3 h-3" />}
                                {dueInfo.text}
                              </span>
                            )}
                          </div>
                        </div>

                        <motion.button
                          onClick={() => setDeleteTarget(todo.id)}
                          className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                          style={{ color: textMuted }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl">🎉</span>
                  <p className="font-kanit text-sm mt-2" style={{ color: textMuted }}>
                    ไม่มีงานค้าง! เก่งมาก!
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
                <span className="font-kanit text-sm">เพิ่มรายการใหม่</span>
              </motion.button>
            </FolderCard>

            {/* Completed Section */}
            {completedFiltered.length > 0 && (
              <FolderCard
                title="เสร็จสิ้นแล้ว"
                headerAction={
                  <motion.button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg font-kanit text-sm text-white"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showCompleted ? "ซ่อน" : "แสดง"} ({completedFiltered.length})
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
                  </motion.button>
                }
              >
                <AnimatePresence>
                  {showCompleted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {completedFiltered.map((todo, index) => (
                        <motion.div
                          key={todo.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl opacity-60"
                          style={{ backgroundColor: isDark ? "#3D3D3D" : "#F8F8F8" }}
                        >
                          <motion.button
                            onClick={() => toggleTodo(todo.id, false)}
                            className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: primaryColor, backgroundColor: primaryColor }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.button>

                          <div className="flex-1 min-w-0">
                            <p className="font-kanit text-sm font-medium line-through" style={{ color: textMuted }}>
                              {todo.text}
                            </p>
                          </div>

                          <motion.button
                            onClick={() => setDeleteTarget(todo.id)}
                            className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: textMuted }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </FolderCard>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="ลบรายการ"
        message="ต้องการลบรายการนี้ใช่ไหม?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) removeTodo(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Add Todo Modal */}
      <AddTodoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTodo}
        subjects={subjects}
      />
    </div>
  );
}

// Add Todo Modal
function AddTodoModal({
  isOpen,
  onClose,
  onAdd,
  subjects
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    text: string;
    category: "homework" | "personal" | "other";
    subjectId?: string;
    subjectName?: string;
    dueDate?: Date;
  }) => Promise<void>;
  subjects: Array<{ id: string; name: string }>;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  const [text, setText] = useState("");
  const [category, setCategory] = useState<"homework" | "personal" | "other">("homework");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [saving, setSaving] = useState(false);

  const backdropBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
  const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setSaving(true);
    try {
      let parsedDueDate: Date | undefined;
      if (dueDate) {
        parsedDueDate = new Date(dueDate);
        if (dueTime) {
          const [hours, minutes] = dueTime.split(':').map(Number);
          parsedDueDate.setHours(hours, minutes);
        }
      }

      const selectedSubject = subjects.find(s => s.id === subjectId);

      await onAdd({
        text: text.trim(),
        category,
        subjectId: category === "homework" ? subjectId : undefined,
        subjectName: category === "homework" ? selectedSubject?.name : undefined,
        dueDate: parsedDueDate,
      });

      setText("");
      setCategory("homework");
      setSubjectId("");
      setDueDate("");
      setDueTime("");
      onClose();
    } catch (error) {
      console.error("Failed to add todo:", error);
    } finally {
      setSaving(false);
    }
  };

  const categoryColors = {
    homework: isDark ? "#00568C" : "#C5E8FF",
    personal: isDark ? "#2A4D2A" : "#D4F5D4",
    other: isDark ? "#4D3A2A" : "#FFE4C9",
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
              เพิ่มรายการใหม่
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  รายละเอียด
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="เช่น ทำการบ้านคณิต บทที่ 5"
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                />
              </div>

              <div>
                <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
                  ประเภท
                </label>
                <div className="flex gap-2">
                  {(["homework", "personal", "other"] as const).map((cat) => {
                    const isActive = category === cat;
                    const catColor = categoryColors[cat];

                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="flex-1 py-2 rounded-xl border-2 font-kanit text-sm transition-all"
                        style={{
                          backgroundColor: isActive ? catColor : "transparent",
                          borderColor: isActive ? primaryColor : "transparent",
                          color: textColor
                        }}
                      >
                        {cat === "homework" && <Book className="w-4 h-4 inline mr-1" />}
                        {cat === "personal" && <UserCircle className="w-4 h-4 inline mr-1" />}
                        {cat === "other" && <Circle className="w-4 h-4 inline mr-1" />}
                        {categoryLabels[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {category === "homework" && (
                <div>
                  <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                    วิชา
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                    style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  >
                    <option value="">เลือกวิชา...</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                    วันกำหนดส่ง
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                    style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  />
                </div>
                <div>
                  <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                    เวลา
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                    style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                  />
                </div>
              </div>

              <motion.button
                onClick={handleSubmit}
                disabled={!text.trim() || saving}
                className="w-full py-3 rounded-xl border-2 font-kanit font-medium flex items-center justify-center gap-2 text-white"
                style={{
                  backgroundColor: primaryColor,
                  borderColor,
                  opacity: (!text.trim() || saving) ? 0.5 : 1
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    เพิ่มรายการ
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

export default function TodoPage() {
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
        <TodoFullPage />
      </div>
    </>
  );
}
