"use client";

import { motion, AnimatePresence, Reorder } from "framer-motion";
import { DesktopLayout, Navbar } from "@/components/layout";
import { PaperCard, RetroButton, ConfirmDialog } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useSubjects } from "@/hooks/useFirebaseData";
import { SubjectWithStats } from "@/contexts/SubjectContext";
import { 
  BookOpen, 
  Plus,
  Loader2,
  Calculator,
  FlaskConical,
  Globe,
  Palette,
  Music,
  MoreVertical,
  CheckCircle2,
  Pencil,
  Trash2,
  GripVertical,
  Calendar,
  Brain,
  X,
  BarChart3
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const iconMap: Record<string, React.ReactNode> = {
  calculator: <Calculator className="w-6 h-6" />,
  flask: <FlaskConical className="w-6 h-6" />,
  globe: <Globe className="w-6 h-6" />,
  book: <BookOpen className="w-6 h-6" />,
  palette: <Palette className="w-6 h-6" />,
  music: <Music className="w-6 h-6" />,
};

export default function SubjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { 
    subjectsWithStats, 
    subjects,
    loading: subjectsLoading, 
    addSubject, 
    editSubject, 
    removeSubject,
    reorderSubjects 
  } = useSubjects();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithStats | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectWithStats | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [orderedSubjects, setOrderedSubjects] = useState<SubjectWithStats[]>([]);

  // Keep ordered subjects in sync
  useEffect(() => {
    setOrderedSubjects(subjectsWithStats);
  }, [subjectsWithStats]);

  const bgColor = isDark ? "#1A1A1A" : "#FFF8E7";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const textFaint = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#1A1A1A";
  const cardBg = isDark ? "#3D3A2A" : "#FFF3B0";

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

  // Calculate totals
  const totalHomework = subjectsWithStats.reduce((sum, s) => sum + s.stats.homeworkTotal, 0);
  const totalPending = subjectsWithStats.reduce((sum, s) => sum + s.stats.homeworkPending, 0);
  const totalFlashcards = subjectsWithStats.reduce((sum, s) => sum + s.stats.flashcardCount, 0);
  const totalSchedule = subjectsWithStats.reduce((sum, s) => sum + s.stats.scheduleCount, 0);

  const handleSaveReorder = async () => {
    const orderedIds = orderedSubjects.map(s => s.id);
    await reorderSubjects(orderedIds);
    setIsReordering(false);
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    await removeSubject(deletingSubject.id);
    setDeletingSubject(null);
  };

  return (
    <DesktopLayout>
      <div className="space-y-6">
        <Navbar />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard 
              icon={<BookOpen className="w-5 h-5" />} 
              label="วิชาทั้งหมด" 
              value={subjects.length}
              color="yellow"
            />
            <StatCard 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="การบ้านรอทำ" 
              value={totalPending}
              subValue={`/${totalHomework}`}
              color="pink"
            />
            <StatCard 
              icon={<Brain className="w-5 h-5" />} 
              label="Flashcards" 
              value={totalFlashcards}
              color="blue"
            />
            <StatCard 
              icon={<Calendar className="w-5 h-5" />} 
              label="คาบเรียน" 
              value={totalSchedule}
              color="green"
            />
          </div>

          <PaperCard color="white" className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-felipa text-3xl flex items-center gap-2" style={{ color: textColor }}>
                <BookOpen className="w-7 h-7 text-[#FF6B6B]" />
                ศูนย์กลางจัดการวิชา
              </h2>
              <div className="flex gap-2">
                {subjects.length > 1 && (
                  <RetroButton 
                    color={isReordering ? "green" : "white"} 
                    size="sm"
                    onClick={() => {
                      if (isReordering) {
                        handleSaveReorder();
                      } else {
                        setIsReordering(true);
                      }
                    }}
                  >
                    <GripVertical className="w-4 h-4 mr-1" />
                    {isReordering ? "บันทึกลำดับ" : "จัดลำดับ"}
                  </RetroButton>
                )}
                {isReordering && (
                  <RetroButton 
                    color="white" 
                    size="sm"
                    onClick={() => {
                      setOrderedSubjects(subjectsWithStats);
                      setIsReordering(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    ยกเลิก
                  </RetroButton>
                )}
                <RetroButton 
                  color="yellow" 
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มวิชา
                </RetroButton>
              </div>
            </div>

            {subjectsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
              </div>
            ) : orderedSubjects.length > 0 ? (
              isReordering ? (
                <Reorder.Group 
                  axis="y" 
                  values={orderedSubjects} 
                  onReorder={setOrderedSubjects}
                  className="space-y-3"
                >
                  {orderedSubjects.map((subject) => (
                    <Reorder.Item key={subject.id} value={subject}>
                      <SubjectCard
                        subject={subject}
                        icon={iconMap[subject.icon] || <BookOpen className="w-6 h-6" />}
                        isReordering={true}
                        onEdit={() => setEditingSubject(subject)}
                        onDelete={() => setDeletingSubject(subject)}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orderedSubjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <SubjectCard
                        subject={subject}
                        icon={iconMap[subject.icon] || <BookOpen className="w-6 h-6" />}
                        isReordering={false}
                        onEdit={() => setEditingSubject(subject)}
                        onDelete={() => setDeletingSubject(subject)}
                      />
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div 
                  className="w-24 h-24 mx-auto mb-4 border-2 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: cardBg, borderColor: borderColor }}
                >
                  <BookOpen className="w-12 h-12" style={{ color: textFaint }} />
                </div>
                <h3 className="font-felipa text-2xl mb-2" style={{ color: textColor }}>ยังไม่มีวิชา</h3>
                <p className="font-kanit mb-4" style={{ color: textMuted }}>เริ่มต้นด้วยการเพิ่มวิชาแรกของคุณ</p>
                <RetroButton color="yellow" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มวิชาใหม่
                </RetroButton>
              </div>
            )}
          </PaperCard>
        </motion.div>

        {/* Add Subject Modal */}
        <AnimatePresence>
          {showAddModal && (
            <SubjectModal
              mode="add"
              onClose={() => setShowAddModal(false)}
              onSave={async (data) => {
                await addSubject(data);
                setShowAddModal(false);
              }}
              subjectsCount={subjects.length}
            />
          )}
        </AnimatePresence>

        {/* Edit Subject Modal */}
        <AnimatePresence>
          {editingSubject && (
            <SubjectModal
              mode="edit"
              subject={editingSubject}
              onClose={() => setEditingSubject(null)}
              onSave={async (data) => {
                await editSubject(editingSubject.id, data);
                setEditingSubject(null);
              }}
              subjectsCount={subjects.length}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        {deletingSubject && (
          <ConfirmDialog
            isOpen={true}
            title="ลบวิชา"
            message={`คุณต้องการลบวิชา "${deletingSubject.name}" หรือไม่?\n\nข้อมูลที่เกี่ยวข้อง:\n• การบ้าน ${deletingSubject.stats.homeworkTotal} รายการ\n• Flashcards ${deletingSubject.stats.flashcardCount} ใบ\n• คาบเรียน ${deletingSubject.stats.scheduleCount} คาบ\n\nข้อมูลเหล่านี้จะไม่ถูกลบ แต่จะไม่มีวิชาเชื่อมโยง`}
            confirmText="ลบวิชา"
            cancelText="ยกเลิก"
            variant="danger"
            onConfirm={handleDeleteSubject}
            onCancel={() => setDeletingSubject(null)}
          />
        )}
      </div>
    </DesktopLayout>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  subValue,
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
  subValue?: string;
  color: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#1A1A1A";

  const bgColors: Record<string, string> = {
    yellow: isDark ? "#4D4A2A" : "#FFF3B0",
    pink: isDark ? "#5C3A42" : "#FFD6E0",
    blue: isDark ? "#2A3A4D" : "#C5E8FF",
    green: isDark ? "#2A4D2A" : "#D4F5D4",
  };

  return (
    <div 
      className="border-2 rounded-xl p-4"
      style={{ 
        backgroundColor: bgColors[color], 
        borderColor,
        boxShadow: isDark ? "none" : "3px 3px 0px #1A1A1A"
      }}
    >
      <div className="flex items-center gap-2 mb-1" style={{ color: textMuted }}>
        {icon}
        <span className="font-kanit text-sm">{label}</span>
      </div>
      <div className="font-felipa text-3xl" style={{ color: textColor }}>
        {value}
        {subValue && <span className="text-lg" style={{ color: textMuted }}>{subValue}</span>}
      </div>
    </div>
  );
}

// Subject Card Component
function SubjectCard({
  subject,
  icon,
  isReordering,
  onEdit,
  onDelete,
}: {
  subject: SubjectWithStats;
  icon: React.ReactNode;
  isReordering: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const textFaint = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#1A1A1A";
  const iconBg = isDark ? "#1A1A1A" : "#FFFFFF";
  const progressBg = isDark ? "#1A1A1A" : "#FFFFFF";
  const menuBg = isDark ? "#2D2D2D" : "#FFFFFF";

  const bgColors: Record<string, string> = {
    yellow: isDark ? "#4D4A2A" : "#FFF3B0",
    pink: isDark ? "#5C3A42" : "#FFD6E0",
    blue: isDark ? "#2A3A4D" : "#C5E8FF",
    green: isDark ? "#2A4D2A" : "#D4F5D4",
    purple: isDark ? "#3D2A4D" : "#E8D5F2",
    orange: isDark ? "#4D3A2A" : "#FFE4C9",
  };

  const bgColor = bgColors[subject.color] || bgColors.yellow;
  const { stats } = subject;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      className={`border-2 rounded-2xl p-4 relative ${isReordering ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        boxShadow: isDark ? "none" : "4px 4px 0px #1A1A1A"
      }}
      whileHover={isReordering ? {} : { scale: 1.02, y: -4 }}
      whileTap={isReordering ? {} : { scale: 0.98 }}
    >
      {/* Folder tab effect */}
      <div 
        className="absolute -top-1 left-4 right-16 h-4 border-2 border-b-0 rounded-t-lg"
        style={{ backgroundColor: bgColor, borderColor: borderColor }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isReordering && (
            <GripVertical className="w-5 h-5" style={{ color: textFaint }} />
          )}
          <div 
            className="w-14 h-14 border-2 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: iconBg, borderColor: borderColor, color: textColor }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-kanit font-semibold text-lg" style={{ color: textColor }}>{subject.name}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: textMuted }}>
              <span>📝 {stats.homeworkPending}/{stats.homeworkTotal}</span>
              <span>🃏 {stats.flashcardCount}</span>
              <span>📅 {stats.scheduleCount} คาบ</span>
            </div>
          </div>
        </div>
        
        {!isReordering && (
          <div className="relative" ref={menuRef}>
            <button 
              className="p-2 rounded-full cursor-pointer hover:opacity-70"
              style={{ color: textFaint }}
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-full mt-1 z-50 border-2 rounded-xl overflow-hidden min-w-[140px]"
                  style={{ 
                    backgroundColor: menuBg, 
                    borderColor,
                    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "4px 4px 0px #1A1A1A"
                  }}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 font-kanit text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ color: textColor }}
                  >
                    <Pencil className="w-4 h-4" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 font-kanit text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    ลบ
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {stats.homeworkTotal > 0 && (
        <div className="mt-4">
          <div 
            className="h-2 border rounded-full overflow-hidden"
            style={{ backgroundColor: progressBg, borderColor: borderColor }}
          >
            <div
              className="h-full bg-green-400 transition-all"
              style={{ width: `${(stats.homeworkCompleted / stats.homeworkTotal) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs font-kanit" style={{ color: textMuted }}>
              เสร็จแล้ว {stats.homeworkCompleted}/{stats.homeworkTotal}
            </span>
            {stats.homeworkCompleted > 0 && (
              <span className="text-xs font-kanit flex items-center gap-1" style={{ color: isDark ? "#6EE7B7" : "#059669" }}>
                <CheckCircle2 className="w-3 h-3" />
                {Math.round((stats.homeworkCompleted / stats.homeworkTotal) * 100)}%
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Subject Modal (Add/Edit)
function SubjectModal({
  mode,
  subject,
  onClose,
  onSave,
  subjectsCount,
}: {
  mode: "add" | "edit";
  subject?: SubjectWithStats;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; color: string; order: number }) => Promise<void>;
  subjectsCount: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [name, setName] = useState(subject?.name || "");
  const [selectedIcon, setSelectedIcon] = useState(subject?.icon || "book");
  const [selectedColor, setSelectedColor] = useState(subject?.color || "yellow");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#1A1A1A";
  const inputBg = isDark ? "#1A1A1A" : "#FFFFFF";

  const bgColors: Record<string, string> = {
    yellow: "#FFF3B0",
    pink: "#FFD6E0",
    blue: "#C5E8FF",
    green: "#D4F5D4",
    purple: "#E8D5F2",
    orange: "#FFE4C9",
  };

  const icons = [
    { id: "calculator", icon: <Calculator className="w-5 h-5" />, label: "คณิต" },
    { id: "flask", icon: <FlaskConical className="w-5 h-5" />, label: "วิทย์" },
    { id: "globe", icon: <Globe className="w-5 h-5" />, label: "ภาษา" },
    { id: "book", icon: <BookOpen className="w-5 h-5" />, label: "ทั่วไป" },
    { id: "palette", icon: <Palette className="w-5 h-5" />, label: "ศิลปะ" },
    { id: "music", icon: <Music className="w-5 h-5" />, label: "ดนตรี" },
  ];

  const colors = ["yellow", "pink", "blue", "green", "purple", "orange"];

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        order: subject?.order ?? subjectsCount,
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
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <PaperCard color="white" className="p-6">
          <h3 className="font-felipa text-2xl mb-4 text-center" style={{ color: textColor }}>
            {mode === "add" ? "📚 เพิ่มวิชาใหม่" : "✏️ แก้ไขวิชา"}
          </h3>

          {/* Name input */}
          <div className="mb-4">
            <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>ชื่อวิชา</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น คณิตศาสตร์"
              className="w-full px-4 py-3 border-2 rounded-xl font-kanit focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
              style={{ backgroundColor: inputBg, borderColor: borderColor, color: textColor }}
              autoFocus
            />
          </div>

          {/* Icon selection */}
          <div className="mb-4">
            <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>ไอคอน</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedIcon(item.id)}
                  className="p-3 rounded-xl border-2 transition-colors cursor-pointer"
                  style={{ 
                    color: textColor,
                    borderColor: selectedIcon === item.id ? borderColor : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"),
                    backgroundColor: selectedIcon === item.id ? (isDark ? "#5C5A2A" : "#FFE066") : "transparent"
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Color selection */}
          <div className="mb-6">
            <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>สี</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="w-10 h-10 rounded-xl border-2 transition-all cursor-pointer"
                  style={{ 
                    backgroundColor: bgColors[color],
                    borderColor: selectedColor === color ? borderColor : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"),
                    boxShadow: selectedColor === color ? `0 0 0 2px ${isDark ? "#2D2D2D" : "#FFFFFF"}, 0 0 0 4px ${borderColor}` : "none"
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <RetroButton color="white" className="flex-1" onClick={onClose}>
              ยกเลิก
            </RetroButton>
            <RetroButton
              color="green"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "add" ? (
                "เพิ่มวิชา"
              ) : (
                "บันทึก"
              )}
            </RetroButton>
          </div>
        </PaperCard>
      </motion.div>
    </motion.div>
  );
}
