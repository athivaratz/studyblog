"use client";

import { motion } from "framer-motion";
import { DesktopLayout, Navbar } from "@/components/layout";
import { PaperCard, RetroButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useSubjects, useHomework } from "@/hooks/useFirebaseData";
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
  CheckCircle2
} from "lucide-react";
import { useState } from "react";

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
  const { subjects, loading: subjectsLoading, addSubject } = useSubjects();
  const { pendingHomework } = useHomework();
  const [showAddModal, setShowAddModal] = useState(false);

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

  const getHomeworkCountForSubject = (subjectId: string) => {
    return pendingHomework.filter(h => h.subjectId === subjectId).length;
  };

  const getCompletedHomeworkCount = (subjectId: string) => {
    return pendingHomework.filter(h => h.subjectId === subjectId && h.completed).length;
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
                <BookOpen className="w-7 h-7 text-[#FF6B6B]" />
                วิชาเรียนทั้งหมด
              </h2>
              <RetroButton 
                color="yellow" 
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มวิชา
              </RetroButton>
            </div>

            {subjectsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
              </div>
            ) : subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SubjectCard
                      name={subject.name}
                      icon={iconMap[subject.icon] || <BookOpen className="w-6 h-6" />}
                      color={subject.color}
                      homeworkCount={getHomeworkCountForSubject(subject.id)}
                      completedCount={getCompletedHomeworkCount(subject.id)}
                    />
                  </motion.div>
                ))}
              </div>
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
        {showAddModal && (
          <AddSubjectModal
            onClose={() => setShowAddModal(false)}
            onAdd={async (data) => {
              await addSubject(data);
              setShowAddModal(false);
            }}
            subjectsCount={subjects.length}
          />
        )}
      </div>
    </DesktopLayout>
  );
}

function SubjectCard({
  name,
  icon,
  color,
  homeworkCount,
  completedCount,
}: {
  name: string;
  icon: React.ReactNode;
  color: string;
  homeworkCount: number;
  completedCount: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const textFaint = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "#1A1A1A";
  const iconBg = isDark ? "#1A1A1A" : "#FFFFFF";
  const progressBg = isDark ? "#1A1A1A" : "#FFFFFF";

  const bgColors: Record<string, string> = {
    yellow: isDark ? "#4D4A2A" : "#FFF3B0",
    pink: isDark ? "#5C3A42" : "#FFD6E0",
    blue: isDark ? "#2A3A4D" : "#C5E8FF",
    green: isDark ? "#2A4D2A" : "#D4F5D4",
    purple: isDark ? "#3D2A4D" : "#E8D5F2",
    orange: isDark ? "#4D3A2A" : "#FFE4C9",
  };

  const bgColor = bgColors[color] || bgColors.yellow;

  return (
    <motion.div
      className="border-2 rounded-2xl p-4 cursor-pointer relative overflow-hidden"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        boxShadow: isDark ? "none" : "4px 4px 0px #1A1A1A"
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Folder tab effect */}
      <div 
        className="absolute -top-1 left-4 right-16 h-4 border-2 border-b-0 rounded-t-lg"
        style={{ backgroundColor: bgColor, borderColor: borderColor }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-14 h-14 border-2 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: iconBg, borderColor: borderColor, color: textColor }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-kanit font-semibold text-lg" style={{ color: textColor }}>{name}</h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
              <span>📝 {homeworkCount} การบ้าน</span>
              {completedCount > 0 && (
                <span className="flex items-center gap-1" style={{ color: isDark ? "#6EE7B7" : "#059669" }}>
                  <CheckCircle2 className="w-3 h-3" />
                  {completedCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <button 
          className="p-2 rounded-full cursor-pointer hover:opacity-70"
          style={{ color: textFaint }}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      {homeworkCount > 0 && (
        <div className="mt-4">
          <div 
            className="h-2 border rounded-full overflow-hidden"
            style={{ backgroundColor: progressBg, borderColor: borderColor }}
          >
            <div
              className="h-full bg-green-400 transition-all"
              style={{ width: `${(completedCount / homeworkCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function AddSubjectModal({
  onClose,
  onAdd,
  subjectsCount,
}: {
  onClose: () => void;
  onAdd: (data: { name: string; icon: string; color: string; order: number }) => Promise<void>;
  subjectsCount: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("book");
  const [selectedColor, setSelectedColor] = useState("yellow");
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
      await onAdd({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        order: subjectsCount,
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
          <h3 className="font-felipa text-2xl mb-4 text-center" style={{ color: textColor }}>📚 เพิ่มวิชาใหม่</h3>

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
              ) : (
                "เพิ่มวิชา"
              )}
            </RetroButton>
          </div>
        </PaperCard>
      </motion.div>
    </motion.div>
  );
}
