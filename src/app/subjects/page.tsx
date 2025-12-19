"use client";

import { motion } from "framer-motion";
import { DesktopLayout, Navbar } from "@/components/layout";
import { PaperCard, RetroButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
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

const bgColors: Record<string, string> = {
  yellow: "bg-[#FFF3B0]",
  pink: "bg-[#FFD6E0]",
  blue: "bg-[#C5E8FF]",
  green: "bg-[#D4F5D4]",
  purple: "bg-[#E8D5F2]",
  orange: "bg-[#FFE4C9]",
};

export default function SubjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const { subjects, loading: subjectsLoading, addSubject } = useSubjects();
  const { pendingHomework } = useHomework();
  const [showAddModal, setShowAddModal] = useState(false);

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
              <h2 className="font-felipa text-3xl flex items-center gap-2">
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
                <div className="w-24 h-24 mx-auto mb-4 bg-[#FFF3B0] dark:bg-[#3D3A2A] border-2 border-black dark:border-white/20 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-black/30 dark:text-white/30" />
                </div>
                <h3 className="font-felipa text-2xl mb-2 dark:text-white">ยังไม่มีวิชา</h3>
                <p className="font-kanit text-black/60 dark:text-white/60 mb-4">เริ่มต้นด้วยการเพิ่มวิชาแรกของคุณ</p>
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
  const darkBgColors: Record<string, string> = {
    yellow: "dark:bg-[#4D4A2A]",
    pink: "dark:bg-[#5C3A42]",
    blue: "dark:bg-[#2A3A4D]",
    green: "dark:bg-[#2A4D2A]",
    purple: "dark:bg-[#3D2A4D]",
    orange: "dark:bg-[#4D3A2A]",
  };

  return (
    <motion.div
      className={`
        ${bgColors[color] || bgColors.yellow} ${darkBgColors[color] || darkBgColors.yellow}
        border-2 border-black dark:border-white/20 rounded-2xl p-4
        shadow-hard dark:shadow-none cursor-pointer
        relative overflow-hidden
      `}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Folder tab effect */}
      <div className={`
        absolute -top-1 left-4 right-16 h-4
        ${bgColors[color] || bgColors.yellow} ${darkBgColors[color] || darkBgColors.yellow}
        border-2 border-black dark:border-white/20 border-b-0
        rounded-t-lg
      `} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white dark:bg-[#1A1A1A] border-2 border-black dark:border-white/20 rounded-xl flex items-center justify-center dark:text-white">
            {icon}
          </div>
          <div>
            <h3 className="font-kanit font-semibold text-lg dark:text-white">{name}</h3>
            <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
              <span>📝 {homeworkCount} การบ้าน</span>
              {completedCount > 0 && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {completedCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer">
          <MoreVertical className="w-5 h-5 text-black/40 dark:text-white/40" />
        </button>
      </div>

      {/* Progress bar */}
      {homeworkCount > 0 && (
        <div className="mt-4">
          <div className="h-2 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 rounded-full overflow-hidden">
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
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("book");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <h3 className="font-felipa text-2xl mb-4 text-center dark:text-white">📚 เพิ่มวิชาใหม่</h3>

          {/* Name input */}
          <div className="mb-4">
            <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-1 block">ชื่อวิชา</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น คณิตศาสตร์"
              className="w-full px-4 py-3 border-2 border-black dark:border-white/20 rounded-xl font-kanit bg-white dark:bg-[#1A1A1A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
            />
          </div>

          {/* Icon selection */}
          <div className="mb-4">
            <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-2 block">ไอคอน</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedIcon(item.id)}
                  className={`
                    p-3 rounded-xl border-2 transition-colors cursor-pointer dark:text-white
                    ${selectedIcon === item.id 
                      ? "border-black dark:border-white bg-[#FFE066] dark:bg-[#5C5A2A]" 
                      : "border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40"
                    }
                  `}
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
            <label className="font-kanit text-sm text-black/60 dark:text-white/60 mb-2 block">สี</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-10 h-10 rounded-xl border-2 transition-all cursor-pointer
                    ${bgColors[color]}
                    ${selectedColor === color 
                      ? "border-black dark:border-white ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-[#2D2D2D]" 
                      : "border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40"
                    }
                  `}
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
