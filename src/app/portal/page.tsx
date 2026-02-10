"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout";
import { FolderCard } from "@/components/ui";
import { IPodPlayer, ClockTimerWidget } from "@/components/widgets";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useSubjects, useQuizQuestions } from "@/hooks/useFirebaseData";
import {
  Loader2,
  Search,
  Play,
  Users,
  Star,
  Clock,
  BookOpen,
  Sparkles,
  Filter,
  ChevronDown,
  X,
  Copy,
  Check,
  Share2,
  Download,
  Eye,
  Trophy,
} from "lucide-react";
import {
  getPublicQuizzes,
  getSharedQuizByCode,
  incrementQuizPlayCount,
  type SharedQuiz,
} from "@/lib/firebaseServices";

interface PublicQuiz {
  id: string;
  title: string;
  description?: string;
  subjectName: string;
  subjectId?: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  playCount: number;
  rating: number;
  tags: string[];
  shareCode: string;
  questions?: Array<{
    question: string;
    correctAnswer: string;
    wrongAnswers: string[];
    difficulty?: "easy" | "medium" | "hard";
    explanation?: string;
  }>;
}
// Category tabs for browsing
const categories = [
  { id: "all", label: "ทั้งหมด", icon: "📚" },
  { id: "popular", label: "ยอดนิยม", icon: "🔥" },
  { id: "recent", label: "ล่าสุด", icon: "✨" },
  { id: "science", label: "วิทยาศาสตร์", icon: "🔬" },
  { id: "math", label: "คณิตศาสตร์", icon: "📐" },
  { id: "language", label: "ภาษา", icon: "📖" },
  { id: "social", label: "สังคม", icon: "🌍" },
];

// Difficulty badge
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    easy: { bg: "#D4F5D4", text: "#166534" },
    medium: { bg: "#FEF3C7", text: "#92400E" },
    hard: { bg: "#FEE2E2", text: "#991B1B" },
    mixed: { bg: "#E0E7FF", text: "#3730A3" },
  };
  const labels = {
    easy: "ง่าย",
    medium: "ปานกลาง",
    hard: "ยาก",
    mixed: "คละระดับ",
  };
  const style = colors[difficulty as keyof typeof colors] || colors.mixed;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-kanit"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {labels[difficulty as keyof typeof labels] || difficulty}
    </span>
  );
}

// Quiz Card Component
function QuizCard({
  quiz,
  onPlay,
  onPreview,
  onImport,
}: {
  quiz: PublicQuiz;
  onPlay: () => void;
  onPreview: () => void;
  onImport: () => void;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";

  return (
    <motion.div
      className="rounded-2xl border-2 overflow-hidden"
      style={{ backgroundColor: cardBg, borderColor: primaryColor }}
      whileHover={{ y: -4, boxShadow: `0 8px 24px rgba(0,86,140,0.15)` }}
    >
      {/* Header with gradient */}
      <div
        className="p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0080C0 100%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-kanit font-bold text-white text-lg line-clamp-1">
              {quiz.title}
            </h3>
            <p className="font-kanit text-white/80 text-sm">
              {quiz.subjectName}
            </p>
          </div>
          <DifficultyBadge difficulty={quiz.difficulty} />
        </div>

        {/* Decorative circles */}
        <div
          className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20"
          style={{ backgroundColor: "#FFFFFF" }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {quiz.description && (
          <p
            className="font-kanit text-sm line-clamp-2 mb-3"
            style={{ color: textMuted }}
          >
            {quiz.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="font-kanit text-sm" style={{ color: textColor }}>
              {quiz.questionCount} ข้อ
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" style={{ color: textMuted }} />
            <span className="font-kanit text-sm" style={{ color: textMuted }}>
              {quiz.playCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-kanit text-sm" style={{ color: textColor }}>
              {quiz.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Creator info */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {quiz.createdByName.charAt(0).toUpperCase()}
          </div>
          <span className="font-kanit text-sm" style={{ color: textMuted }}>
            โดย {quiz.createdByName}
          </span>
        </div>

        {/* Tags */}
        {quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {quiz.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs font-kanit"
                style={{
                  backgroundColor: isDark ? "#404040" : "#F0F0F0",
                  color: textMuted,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={onPlay}
            className="flex-1 py-2 rounded-xl font-kanit text-sm text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-4 h-4" />
            เล่น
          </motion.button>
          <motion.button
            onClick={onPreview}
            className="p-2 rounded-xl border-2"
            style={{ borderColor: primaryColor, color: primaryColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onImport}
            className="p-2 rounded-xl border-2"
            style={{ borderColor: primaryColor, color: primaryColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Preview Modal
function PreviewModal({
  quiz,
  onClose,
  onPlay,
}: {
  quiz: PublicQuiz | null;
  onClose: () => void;
  onPlay: () => void;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const [copied, setCopied] = useState(false);

  if (!quiz) return null;

  const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(quiz.shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg rounded-2xl border-2 overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: modalBg, borderColor: primaryColor }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 relative"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0080C0 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <h2 className="font-felipa text-2xl text-white mb-2">{quiz.title}</h2>
          <p className="font-kanit text-white/80">{quiz.subjectName}</p>

          <div className="flex items-center gap-4 mt-4">
            <DifficultyBadge difficulty={quiz.difficulty} />
            <div className="flex items-center gap-1 text-white/80">
              <BookOpen className="w-4 h-4" />
              <span className="font-kanit text-sm">{quiz.questionCount} ข้อ</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {quiz.description && (
            <p className="font-kanit mb-4" style={{ color: textMuted }}>
              {quiz.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="font-felipa text-2xl" style={{ color: primaryColor }}>
                {quiz.playCount.toLocaleString()}
              </p>
              <p className="font-kanit text-xs" style={{ color: textMuted }}>
                ครั้งที่เล่น
              </p>
            </div>
            <div className="text-center">
              <p className="font-felipa text-2xl" style={{ color: "#F59E0B" }}>
                {quiz.rating.toFixed(1)}
              </p>
              <p className="font-kanit text-xs" style={{ color: textMuted }}>
                คะแนน
              </p>
            </div>
            <div className="text-center">
              <p className="font-felipa text-2xl" style={{ color: textColor }}>
                {quiz.createdByName.slice(0, 8)}
              </p>
              <p className="font-kanit text-xs" style={{ color: textMuted }}>
                ผู้สร้าง
              </p>
            </div>
          </div>

          {/* Share Code */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{ backgroundColor: isDark ? "#3D3D3D" : "#F5F5F5" }}
          >
            <p className="font-kanit text-sm mb-2" style={{ color: textMuted }}>
              รหัสแชร์
            </p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 font-mono text-lg font-bold"
                style={{ color: primaryColor }}
              >
                {quiz.shareCode}
              </code>
              <motion.button
                onClick={handleCopyCode}
                className="p-2 rounded-lg"
                style={{ backgroundColor: isDark ? "#505050" : "#E0E0E0" }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" style={{ color: textMuted }} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Sample Questions */}
          {quiz.questions && quiz.questions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-kanit font-medium mb-3" style={{ color: textColor }}>
                ตัวอย่างคำถาม
              </h4>
              <div className="space-y-3">
                {quiz.questions.slice(0, 2).map((q, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: isDark ? "#3D3D3D" : "#F5F5F5" }}
                  >
                    <p className="font-kanit text-sm" style={{ color: textColor }}>
                      {i + 1}. {q.question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={onPlay}
              className="flex-1 py-3 rounded-xl font-kanit font-medium text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" />
              เริ่มเล่น
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Import Code Modal
function ImportCodeModal({
  isOpen,
  onClose,
  onImport,
  error,
  loading: importLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (code: string) => void;
  error?: string | null;
  loading?: boolean;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border-2 p-6"
        style={{ backgroundColor: modalBg, borderColor: primaryColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-felipa text-xl mb-4" style={{ color: textColor }}>
          นำเข้าข้อสอบ
        </h3>

        <p className="font-kanit text-sm mb-4" style={{ color: textMuted }}>
          ใส่รหัสแชร์ 6 หลักเพื่อนำเข้าข้อสอบ
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="เช่น ABC123"
          maxLength={6}
          disabled={importLoading}
          className="w-full px-4 py-3 rounded-xl border-2 font-mono text-xl text-center uppercase tracking-widest focus:outline-none disabled:opacity-50"
          style={{
            backgroundColor: inputBg,
            borderColor: error ? "#EF4444" : primaryColor,
            color: textColor,
          }}
        />

        {/* Error message */}
        {error && (
          <p className="font-kanit text-sm text-red-500 mt-2">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          <motion.button
            onClick={onClose}
            disabled={importLoading}
            className="flex-1 py-2 rounded-xl border-2 font-kanit disabled:opacity-50"
            style={{ borderColor: primaryColor, color: textColor }}
            whileTap={{ scale: 0.98 }}
          >
            ยกเลิก
          </motion.button>
          <motion.button
            onClick={() => {
              if (code.length === 6 && !importLoading) {
                onImport(code);
              }
            }}
            disabled={code.length !== 6 || importLoading}
            className="flex-1 py-2 rounded-xl font-kanit text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
            whileTap={{ scale: 0.98 }}
          >
            {importLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังนำเข้า...
              </>
            ) : (
              "นำเข้า"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PortalPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const router = useRouter();
  const { subjects } = useSubjects();
  const { addQuestions } = useQuizQuestions();

  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewQuiz, setPreviewQuiz] = useState<PublicQuiz | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const inputBg = isDark ? "#3D3D3D" : "#FFFFFF";

  // Fetch shared quizzes from Firestore via service layer
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const fetchedQuizzes = await getPublicQuizzes(50);
        // Map SharedQuiz to PublicQuiz shape
        setQuizzes(
          fetchedQuizzes.map((q) => ({
            id: q.id,
            title: q.title,
            description: q.description,
            subjectName: q.subjectName || "ทั่วไป",
            subjectId: q.subjectId,
            questionCount: q.questionCount,
            difficulty: (q.difficulty || "mixed") as PublicQuiz["difficulty"],
            createdBy: q.createdBy,
            createdByName: q.createdByName || "ไม่ระบุ",
            createdAt: q.createdAt instanceof Date ? q.createdAt : new Date(),
            playCount: q.playCount || 0,
            rating: q.rating || 0,
            tags: q.tags || [],
            shareCode: q.shareCode,
            questions: q.questions?.map(sq => ({
              question: sq.question,
              correctAnswer: sq.correctAnswer,
              wrongAnswers: sq.wrongAnswers || [],
              difficulty: sq.difficulty,
              explanation: sq.explanation,
            })),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user]);

  // Handle import quiz by share code
  const handleImportQuiz = async (shareCode: string) => {
    setImportError(null);
    setImportLoading(true);
    try {
      const quizData = await getSharedQuizByCode(shareCode);

      if (!quizData) {
        setImportError("ไม่พบข้อสอบ หรือรหัสหมดอายุแล้ว");
        return;
      }

      // If quiz has questions, import them
      if (quizData.questions && quizData.questions.length > 0) {
        await addQuestions(quizData.questions.map((q: {question: string; correctAnswer: string; wrongAnswers: string[]; difficulty?: string; subjectId?: string; subjectName?: string; topic?: string; explanation?: string; source?: string}) => ({
          question: q.question,
          correctAnswer: q.correctAnswer,
          wrongAnswers: q.wrongAnswers || [],
          difficulty: (q.difficulty || "medium") as "easy" | "medium" | "hard",
          subjectId: q.subjectId || "",
          subjectName: q.subjectName || quizData.subjectName || "",
          topic: q.topic || "",
          explanation: q.explanation || "",
          source: "csv" as const,
        })));
        
        // Increment play count via service
        await incrementQuizPlayCount(quizData.id);
        
        setShowImportModal(false);
        alert(`นำเข้าสำเร็จ! เพิ่ม ${quizData.questions.length} คำถาม`);
      } else {
        setImportError("ข้อสอบนี้ไม่มีคำถาม");
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportError("เกิดข้อผิดพลาดในการนำเข้า");
    } finally {
      setImportLoading(false);
    }
  };

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    let result = [...quizzes];

    // Search filter
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(queryLower) ||
          q.subjectName.toLowerCase().includes(queryLower) ||
          q.tags.some((t) => t.toLowerCase().includes(queryLower))
      );
    }

    // Category filter
    if (selectedCategory === "popular") {
      result.sort((a, b) => b.playCount - a.playCount);
    } else if (selectedCategory === "recent") {
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (selectedCategory !== "all") {
      const categoryMap: Record<string, string[]> = {
        science: ["วิทยาศาสตร์", "ฟิสิกส์", "เคมี", "ชีววิทยา"],
        math: ["คณิตศาสตร์"],
        language: ["ภาษาอังกฤษ", "ภาษาไทย", "ภาษา"],
        social: ["สังคมศึกษา", "ประวัติศาสตร์"],
      };
      const subjects = categoryMap[selectedCategory] || [];
      result = result.filter((q) =>
        subjects.some((s) => q.subjectName.includes(s))
      );
    }

    return result;
  }, [quizzes, searchQuery, selectedCategory]);

  const handlePlayQuiz = async (quiz: PublicQuiz) => {
    // Import quiz questions and navigate to review page
    if (quiz.questions && quiz.questions.length > 0) {
      try {
        await addQuestions(quiz.questions.map((q) => ({
          question: q.question,
          correctAnswer: q.correctAnswer,
          wrongAnswers: q.wrongAnswers || [],
          difficulty: (q.difficulty || "medium") as "easy" | "medium" | "hard",
          subjectId: quiz.subjectId || "",
          subjectName: quiz.subjectName || "",
          topic: "",
          explanation: q.explanation || "",
          source: "csv" as const,
        })));
        
        // Increment play count via service
        await incrementQuizPlayCount(quiz.id);
        
        alert(`นำเข้าสำเร็จ ${quiz.questions.length} คำถาม! ไปที่หน้าทบทวนเพื่อเล่น`);
        router.push("/review");
      } catch (error) {
        console.error("Play error:", error);
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } else {
      // If no embedded questions, try to import by share code
      await handleImportQuiz(quiz.shareCode);
    }
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
            <FolderCard title="🔮 Quiz Portal">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-kanit" style={{ color: textMuted }}>
                    สำรวจและเล่นข้อสอบจากผู้ใช้ทั่วประเทศ
                  </p>
                </div>
                <motion.button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 rounded-xl font-kanit text-sm flex items-center gap-2 text-white"
                  style={{ backgroundColor: primaryColor }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-4 h-4" />
                  ใส่รหัส
                </motion.button>
              </div>
            </FolderCard>

            {/* Search & Filter */}
            <div
              className="rounded-2xl border-2 p-4"
              style={{ backgroundColor: cardBg, borderColor: primaryColor }}
            >
              {/* Search */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: textMuted }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาข้อสอบ..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                  style={{
                    backgroundColor: inputBg,
                    borderColor: primaryColor,
                    color: textColor,
                  }}
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="px-3 py-1.5 rounded-full font-kanit text-sm flex items-center gap-1.5"
                    style={{
                      backgroundColor:
                        selectedCategory === cat.id
                          ? primaryColor
                          : isDark
                          ? "#3D3D3D"
                          : "#F0F0F0",
                      color: selectedCategory === cat.id ? "#FFFFFF" : textColor,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quiz Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
              </div>
            ) : filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onPlay={() => handlePlayQuiz(quiz)}
                    onPreview={() => setPreviewQuiz(quiz)}
                    onImport={() => handleImportQuiz(quiz.shareCode)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-3" style={{ color: textMuted }} />
                <p className="font-kanit" style={{ color: textMuted }}>
                  ไม่พบข้อสอบที่ค้นหา
                </p>
              </div>
            )}

            {/* Featured Section */}
            <FolderCard title="🏆 ข้อสอบยอดนิยมประจำสัปดาห์">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[...quizzes].sort((a, b) => b.playCount - a.playCount).slice(0, 3).map((quiz, i) => (
                  <motion.div
                    key={quiz.id}
                    className="p-4 rounded-xl flex items-center gap-3"
                    style={{
                      backgroundColor: isDark ? "#3D3D3D" : "#F8F8F8",
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-felipa text-xl text-white"
                      style={{
                        backgroundColor:
                          i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-kanit font-medium truncate"
                        style={{ color: textColor }}
                      >
                        {quiz.title}
                      </p>
                      <p className="font-kanit text-xs" style={{ color: textMuted }}>
                        {quiz.playCount.toLocaleString()} plays
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FolderCard>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewQuiz && (
          <PreviewModal
            quiz={previewQuiz}
            onClose={() => setPreviewQuiz(null)}
            onPlay={() => {
              handlePlayQuiz(previewQuiz);
              setPreviewQuiz(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Import Code Modal */}
      <AnimatePresence>
        {showImportModal && (
          <ImportCodeModal
            isOpen={showImportModal}
            onClose={() => { setShowImportModal(false); setImportError(null); }}
            onImport={handleImportQuiz}
            error={importError}
            loading={importLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
