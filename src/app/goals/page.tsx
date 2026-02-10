"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout";
import { FolderCard, ConfirmDialog } from "@/components/ui";
import { IPodPlayer, ClockTimerWidget } from "@/components/widgets";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginCard } from "@/components/auth";
import { useStudyGoals } from "@/hooks/useFirebaseData";
import {
  Loader2,
  Plus,
  Target,
  X,
  Save,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  Award,
  TrendingUp,
} from "lucide-react";

const goalTypes = [
  { value: "homework", label: "ทำการบ้าน", icon: "📚", unit: "ชิ้น" },
  { value: "quiz", label: "ทำแบบทดสอบ", icon: "🎯", unit: "ครั้ง" },
  { value: "study_hours", label: "เวลาเรียน", icon: "⏰", unit: "ชั่วโมง" },
  { value: "streak", label: "Streak ติดต่อกัน", icon: "🔥", unit: "วัน" },
  { value: "custom", label: "กำหนดเอง", icon: "✨", unit: "" },
];

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const { goals, loading, addGoal, updateGoal, removeGoal } = useStudyGoals();

  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; goalId: string | null }>({
    show: false,
    goalId: null,
  });

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTargetType, setNewTargetType] = useState<string>("homework");
  const [newTargetValue, setNewTargetValue] = useState<number>(5);
  const [newTargetDate, setNewTargetDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";

  // Separate active and completed goals
  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  const handleAddGoal = async () => {
    if (!newTitle.trim()) return;
    await addGoal({
      title: newTitle,
      description: newDescription || undefined,
      targetType: newTargetType as "homework" | "quiz" | "study_hours" | "streak" | "custom",
      targetValue: newTargetValue,
      targetDate: new Date(newTargetDate),
    });
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewTargetType("homework");
    setNewTargetValue(5);
    setNewTargetDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  };

  const handleToggleComplete = async (goalId: string, completed: boolean) => {
    await updateGoal(goalId, { completed, currentValue: completed ? goals.find(g => g.id === goalId)?.targetValue || 0 : 0 });
  };

  const handleDeleteGoal = async () => {
    if (confirmDelete.goalId) {
      await removeGoal(confirmDelete.goalId);
      setConfirmDelete({ show: false, goalId: null });
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: "เลยกำหนด", urgent: true };
    if (days === 0) return { text: "วันนี้", urgent: true };
    if (days === 1) return { text: "พรุ่งนี้", urgent: false };
    return { text: `อีก ${days} วัน`, urgent: false };
  };

  const getGoalTypeInfo = (type: string) => {
    return goalTypes.find((t) => t.value === type) || goalTypes[4];
  };

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: pageBg }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    );
  }

  if (!user) {
    return <LoginCard />;
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: pageBg }}>
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <Navbar />

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6">
          {/* Left Sidebar */}
          <div className="hidden xl:flex flex-col gap-6">
            <IPodPlayer />
            <ClockTimerWidget size={180} />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <FolderCard title={t("goals.title")}>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" style={{ color: primaryColor }} />
                <p className="font-kanit text-sm" style={{ color: textMuted }}>
                  ตั้งเป้าหมายและติดตามความก้าวหน้า
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center">
                  <p className="font-felipa text-2xl" style={{ color: primaryColor }}>
                    {activeGoals.length}
                  </p>
                  <p className="font-kanit text-xs" style={{ color: textMuted }}>
                    กำลังดำเนินการ
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-felipa text-2xl" style={{ color: "#22C55E" }}>
                    {completedGoals.length}
                  </p>
                  <p className="font-kanit text-xs" style={{ color: textMuted }}>
                    สำเร็จแล้ว
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-felipa text-2xl" style={{ color: primaryColor }}>
                    {goals.length > 0
                      ? Math.round((completedGoals.length / goals.length) * 100)
                      : 0}
                    %
                  </p>
                  <p className="font-kanit text-xs" style={{ color: textMuted }}>
                    อัตราสำเร็จ
                  </p>
                </div>
              </div>
            </FolderCard>

            {/* Active Goals */}
            <FolderCard title={`${t("goals.in_progress")} (${activeGoals.length})`}>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
                </div>
              ) : activeGoals.length > 0 ? (
                <div className="space-y-3">
                  {activeGoals.map((goal) => {
                    const typeInfo = getGoalTypeInfo(goal.targetType);
                    const dateInfo = formatDate(goal.targetDate);
                    const progress = Math.min(
                      (goal.currentValue / goal.targetValue) * 100,
                      100
                    );

                    return (
                      <motion.div
                        key={goal.id}
                        className="rounded-xl border-2 p-4"
                        style={{ borderColor: primaryColor, backgroundColor: cardBg }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleComplete(goal.id, true)}
                            className="mt-1"
                          >
                            <Circle
                              className="w-5 h-5 transition-colors"
                              style={{ color: primaryColor }}
                            />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{typeInfo.icon}</span>
                              <h4
                                className="font-kanit font-medium truncate"
                                style={{ color: textColor }}
                              >
                                {goal.title}
                              </h4>
                            </div>

                            {goal.description && (
                              <p
                                className="font-kanit text-sm mt-1"
                                style={{ color: textMuted }}
                              >
                                {goal.description}
                              </p>
                            )}

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-kanit text-xs" style={{ color: textMuted }}>
                                  {goal.currentValue} / {goal.targetValue} {typeInfo.unit}
                                </span>
                                <span
                                  className="font-kanit text-xs"
                                  style={{ color: dateInfo.urgent ? "#EF4444" : textMuted }}
                                >
                                  {dateInfo.text}
                                </span>
                              </div>
                              <div
                                className="h-2 rounded-full overflow-hidden"
                                style={{ backgroundColor: isDark ? "#404040" : "#E5E7EB" }}
                              >
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: primaryColor }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              setConfirmDelete({ show: true, goalId: goal.id })
                            }
                            className="p-1.5"
                            style={{ color: textMuted }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-2" style={{ color: textMuted }} />
                  <p className="font-kanit" style={{ color: textMuted }}>
                    {t("goals.no_goals")}
                  </p>
                </div>
              )}
            </FolderCard>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <FolderCard title={`${t("goals.completed")} (${completedGoals.length})`}>
                <div className="space-y-3">
                  {completedGoals.map((goal) => {
                    const typeInfo = getGoalTypeInfo(goal.targetType);

                    return (
                      <motion.div
                        key={goal.id}
                        className="rounded-xl border-2 p-4 opacity-60"
                        style={{ borderColor: "#22C55E", backgroundColor: cardBg }}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5" style={{ color: "#22C55E" }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{typeInfo.icon}</span>
                              <h4
                                className="font-kanit font-medium line-through"
                                style={{ color: textMuted }}
                              >
                                {goal.title}
                              </h4>
                            </div>
                          </div>
                          <Award className="w-5 h-5" style={{ color: "#FFD700" }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </FolderCard>
            )}

            {/* Add Button */}
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `4px 4px 0px ${isDark ? "#404040" : "#003D66"}`,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border-2 p-6 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: cardBg,
                borderColor: primaryColor,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-felipa text-xl" style={{ color: textColor }}>
                  {t("goals.add_goal")}
                </h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" style={{ color: textMuted }} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Goal Type */}
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    ประเภทเป้าหมาย
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {goalTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setNewTargetType(type.value)}
                        className="p-3 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor:
                            newTargetType === type.value ? primaryColor : "transparent",
                          backgroundColor:
                            newTargetType === type.value
                              ? `${primaryColor}20`
                              : inputBg,
                        }}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <p className="font-kanit text-sm mt-1" style={{ color: textColor }}>
                          {type.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    ชื่อเป้าหมาย
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="เช่น ทำการบ้านให้ครบทุกวิชา"
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: primaryColor,
                      color: textColor,
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    รายละเอียด (ไม่บังคับ)
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม..."
                    rows={2}
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit resize-none"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: primaryColor,
                      color: textColor,
                    }}
                  />
                </div>

                {/* Target Value */}
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    เป้าหมาย ({getGoalTypeInfo(newTargetType).unit || "จำนวน"})
                  </label>
                  <input
                    type="number"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: primaryColor,
                      color: textColor,
                    }}
                  />
                </div>

                {/* Target Date */}
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    กำหนดเสร็จ
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: primaryColor,
                      color: textColor,
                    }}
                  />
                </div>
              </div>

              <motion.button
                onClick={handleAddGoal}
                disabled={!newTitle.trim()}
                className="w-full mt-6 py-2 rounded-xl font-kanit text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                สร้างเป้าหมาย
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        onCancel={() => setConfirmDelete({ show: false, goalId: null })}
        onConfirm={handleDeleteGoal}
        title="ลบเป้าหมาย"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบเป้าหมายนี้?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        variant="danger"
      />
    </div>
  );
}
