"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Helper to get urgent threshold (2 days from now)
const getUrgentThreshold = () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
import Link from "next/link";
import { Navbar, MobileHeader, LoadingScreen } from "@/components/layout";
import { FolderCard, ConfirmDialog } from "@/components/ui";
import { IPodPlayer, MobileUtilities, ClockTimerWidget } from "@/components/widgets";
import { TutorialOverlay } from "@/components/tutorial";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useTodos, useInitializeUser } from "@/hooks/useFirebaseData";
import {
  Loader2,
  ChevronDown,
  Check,
  Trash2,
  AlertCircle,
  Circle,
  SquarePlus
} from "lucide-react";

// Category labels
const categoryLabels = {
  all: "ทั้งหมด",
  homework: "การบ้าน",
  personal: "ส่วนตัว",
  other: "อื่นๆ",
};

// Todo Dashboard
function TodoDashboard() {
  const { userProfile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const {
    todos,
    pendingTodos,
    overdueTodos,
    loading,
    toggleTodo,
    removeTodo
  } = useTodos();

  const [filter, setFilter] = useState<"all" | "homework" | "personal" | "other">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; todoId: string | null }>({ show: false, todoId: null });

  const displayName = userProfile?.displayName?.split(" ")[0] || "นักเรียน";

  // Theme colors
  const primaryColor = "#00568C";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const textFaint = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const borderColor = primaryColor;
  const dropdownBg = isDark ? "#3D3D3D" : "#FFFFFF";
  const hoverBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";

  // Calculate urgent threshold using lazy initial state (runs only once)
  const [urgentThreshold] = useState<Date>(getUrgentThreshold);

  // Filter todos
  const filteredTodos = filter === "all"
    ? todos
    : todos.filter(t => t.category === filter);

  const pendingFiltered = filteredTodos.filter(t => !t.completed);
  const urgentCount = todos.filter(t => !t.completed && t.dueDate &&
    t.dueDate <= urgentThreshold).length;

  // Format date
  const formatDueDate = (date?: Date) => {
    if (!date) return null;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: "เลยกำหนด", urgent: true };
    if (days === 0) return { text: "วันนี้", urgent: true };
    if (days === 1) return { text: "พรุ่งนี้", urgent: false };

    const d = date.getDate();
    const m = date.getMonth() + 1;
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return { text: `${d} ${months[m - 1]}`, urgent: false };
  };

  const categoryColors = {
    homework: isDark ? "#00568C" : "#C5E8FF",
    personal: isDark ? "#2A4D2A" : "#D4F5D4",
    other: isDark ? "#4D3A2A" : "#FFE4C9",
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
          <div className="space-y-6">
            {/* Welcome Card with Stats */}
            <FolderCard id="tour-stats" title={`สวัสดี, ${displayName}!`}>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="font-felipa text-2xl lg:text-3xl" style={{ color: primaryColor }}>
                    {pendingTodos.length}
                  </p>
                  <p className="font-kanit text-[10px] lg:text-xs" style={{ color: textMuted }}>
                    การบ้านค้าง
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-felipa text-2xl lg:text-3xl" style={{ color: primaryColor }}>
                    {urgentCount}
                  </p>
                  <p className="font-kanit text-[10px] lg:text-xs" style={{ color: textMuted }}>
                    เร่งด่วน
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-felipa text-2xl lg:text-3xl" style={{ color: primaryColor }}>
                    {overdueTodos.length}
                  </p>
                  <p className="font-kanit text-[10px] lg:text-xs" style={{ color: textMuted }}>
                    เลยกำหนด
                  </p>
                </div>
              </div>
            </FolderCard>

            {/* Todo List */}
            <FolderCard
              id="tour-todo"
              title="To-do"
              headerAction={
                <div className="flex items-center gap-2">
                  {/* Manage button */}
                  <Link href="/todo">
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-white"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SquarePlus className="w-4 h-4" />
                    </motion.div>
                  </Link>

                  {/* Filter dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg font-kanit text-sm text-white"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {categoryLabels[filter]}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {showFilterDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-1 w-32 rounded-xl border-2 overflow-hidden z-50"
                          style={{ backgroundColor: dropdownBg, borderColor }}
                        >
                          {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((key) => (
                            <button
                              key={key}
                              onClick={() => {
                                setFilter(key);
                                setShowFilterDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left font-kanit text-sm flex items-center gap-2 transition-colors"
                              style={{
                                color: textColor,
                                backgroundColor: filter === key ? hoverBg : "transparent"
                              }}
                            >
                              {filter === key && <Check className="w-3 h-3" />}
                              {categoryLabels[key]}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              }
            >
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
                        className="flex items-center gap-3 p-3 rounded-xl border-2"
                        style={{ borderColor: "transparent", backgroundColor: isDark ? "#3D3D3D" : "#F8F8F8" }}
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
                          <p className="font-kanit text-sm font-medium truncate" style={{ color: textColor }}>
                            {todo.text}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
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
                          onClick={() => setConfirmDelete({ show: true, todoId: todo.id })}
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
            </FolderCard>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="ลบรายการ?"
        message="คุณต้องการลบรายการนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (confirmDelete.todoId) {
            removeTodo(confirmDelete.todoId);
          }
          setConfirmDelete({ show: false, todoId: null });
        }}
        onCancel={() => setConfirmDelete({ show: false, todoId: null })}
      />
    </div>
  );
}

export default function HomePage() {
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
        <TodoDashboard />
      </div>
    </>
  );
}
