"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar, MobileHeader, LoadingScreen } from "@/components/layout";
import { FolderCard } from "@/components/ui";
import { ClockTimerWidget, IPodPlayer, MobileUtilities, CSVImportModal, AIQuizGenerator } from "@/components/widgets";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useFlashcards, useSubjects, useReviewSessions, useQuizQuestions, useSharedQuiz } from "@/hooks/useFirebaseData";
import {
  Loader2,
  Plus,
  Brain,
  Zap,
  Target,
  X,
  Check,
  RotateCcw,
  ChevronDown,
  Trash2,
  Sparkles,
  FileSpreadsheet,
  BookOpen,
  Share2,
  Copy,
  Link,
  Users,
  QrCode,
  Edit2,
  ChevronRight,
  FolderOpen,
  Save,
  Play,
  ArrowLeft,
  Layers,
} from "lucide-react";

// Types
interface GameState {
  mode: "quiz" | "memory" | "speed" | null;
  isPlaying: boolean;
  currentQuestion: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeLeft: number;
  startTime: Date | null;
  cards: Array<{
    id: string;
    front: string;
    back: string;
    subjectId?: string;
    subjectName?: string;
    wrongAnswers?: string[];
    source?: "flashcard" | "quiz";
  }>;
}

// Stats Card Component
function StatsCard({ value, label }: { value: number | string; label: string }) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  const bgColor = isDark ? "#2D2D2D" : "#FFFFFF";
  const mutedColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";

  return (
    <motion.div
      className="rounded-2xl border-2 p-4 text-center"
      style={{ backgroundColor: bgColor, borderColor: primaryColor }}
      whileHover={{ scale: 1.02 }}
    >
      <p className="font-felipa text-3xl lg:text-4xl" style={{ color: primaryColor }}>
        {value}
      </p>
      <p className="font-kanit text-xs lg:text-sm" style={{ color: mutedColor }}>
        {label}
      </p>
    </motion.div>
  );
}

// Share Quiz Modal Component
function ShareQuizModal({
  isOpen,
  onClose,
  flashcardCount,
  quizQuestionCount,
  onShare,
  loading,
  shareResult,
}: {
  isOpen: boolean;
  onClose: () => void;
  flashcardCount: number;
  quizQuestionCount: number;
  onShare: (title: string, expiryDays: number) => void;
  loading: boolean;
  shareResult: { shareCode: string; shareUrl: string } | null;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const [title, setTitle] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [copied, setCopied] = useState<"code" | "url" | null>(null);

  const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";

  const totalQuestions = flashcardCount + quizQuestionCount;

  const handleCopy = async (text: string, type: "code" | "url") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50" />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-md z-10 rounded-2xl border-2 p-6 max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: modalBg, borderColor: primaryColor }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-felipa text-2xl" style={{ color: textColor }}>
                แชร์ข้อสอบ
              </h3>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5" style={{ color: textMuted }} />
            </button>
          </div>

          {!shareResult ? (
            // Share Form
            <div className="space-y-4">
              {/* Summary */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: isDark ? "#3D3D3D" : "#F0F0F0" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="font-kanit text-sm font-medium" style={{ color: textColor }}>
                    ข้อมูลที่จะแชร์
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: modalBg }}>
                    <p className="font-felipa text-xl" style={{ color: primaryColor }}>{flashcardCount}</p>
                    <p className="font-kanit text-xs" style={{ color: textMuted }}>Flashcards</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: modalBg }}>
                    <p className="font-felipa text-xl" style={{ color: primaryColor }}>{quizQuestionCount}</p>
                    <p className="font-kanit text-xs" style={{ color: textMuted }}>คำถาม AI</p>
                  </div>
                </div>
                <p className="font-kanit text-xs text-center mt-2" style={{ color: textMuted }}>
                  รวม {totalQuestions} ข้อ
                </p>
              </div>

              {/* Title Input */}
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  ชื่อข้อสอบ
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ข้อสอบคณิตศาสตร์ ม.6"
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                  style={{ backgroundColor: inputBg, borderColor: primaryColor, color: textColor }}
                />
              </div>

              {/* Expiry Days */}
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  หมดอายุใน
                </label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                  style={{ backgroundColor: inputBg, borderColor: primaryColor, color: textColor }}
                >
                  <option value={1}>1 วัน</option>
                  <option value={3}>3 วัน</option>
                  <option value={7}>7 วัน</option>
                  <option value={14}>14 วัน</option>
                  <option value={30}>30 วัน</option>
                </select>
              </div>

              {/* Share Button */}
              <motion.button
                onClick={() => onShare(title || "ข้อสอบของฉัน", expiryDays)}
                disabled={loading || totalQuestions === 0}
                className="w-full py-3 rounded-xl font-kanit font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    สร้างลิงก์แชร์
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            // Share Result
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "#22C55E" }}>
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-kanit font-medium text-lg" style={{ color: textColor }}>
                  สร้างลิงก์สำเร็จ!
                </h4>
                <p className="font-kanit text-sm" style={{ color: textMuted }}>
                  แชร์รหัสหรือลิงก์ให้เพื่อนเพื่อทำข้อสอบ
                </p>
              </div>

              {/* Share Code */}
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  รหัสข้อสอบ
                </label>
                <div
                  className="flex items-center gap-2 p-3 rounded-xl border-2"
                  style={{ backgroundColor: inputBg, borderColor: primaryColor }}
                >
                  <QrCode className="w-5 h-5" style={{ color: primaryColor }} />
                  <span className="flex-1 font-mono text-xl font-bold tracking-wider" style={{ color: textColor }}>
                    {shareResult.shareCode}
                  </span>
                  <motion.button
                    onClick={() => handleCopy(shareResult.shareCode, "code")}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: copied === "code" ? "#22C55E" : primaryColor }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied === "code" ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Share Link */}
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  ลิงก์แชร์
                </label>
                <div
                  className="flex items-center gap-2 p-3 rounded-xl border-2"
                  style={{ backgroundColor: inputBg, borderColor: primaryColor }}
                >
                  <Link className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="flex-1 font-kanit text-sm truncate" style={{ color: textColor }}>
                    {shareResult.shareUrl}
                  </span>
                  <motion.button
                    onClick={() => handleCopy(shareResult.shareUrl, "url")}
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: copied === "url" ? "#22C55E" : primaryColor }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied === "url" ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="w-full py-3 rounded-xl border-2 font-kanit font-medium"
                style={{ borderColor: primaryColor, color: textColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ปิด
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Main Review Dashboard
function ReviewDashboard() {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const { userProfile } = useAuth();
  const isDark = theme === "dark";
  const { subjects } = useSubjects();
  const { flashcards, dueForReview, loading, addFlashcard, removeFlashcard, reviewFlashcard } = useFlashcards();
  const { stats, addSession } = useReviewSessions();
  const {
    questions: quizQuestions,
    quizSets,
    addQuestions,
    addQuizSet,
    editQuestion,
    editQuizSet,
    removeQuestion,
    removeQuizSet,
  } = useQuizQuestions();
  const { shareQuiz, loading: shareLoading } = useSharedQuiz();

  const [gameState, setGameState] = useState<GameState>({
    mode: null,
    isPlaying: false,
    currentQuestion: 0,
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    timeLeft: 60,
    startTime: null,
    cards: [],
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareResult, setShareResult] = useState<{ shareCode: string; shareUrl: string } | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [managingSetId, setManagingSetId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{question: string; correctAnswer: string; wrongAnswers: string[]; difficulty: string} | null>(null);
  const [editSetForm, setEditSetForm] = useState<{name: string; description: string} | null>(null);
  const [shareSetId, setShareSetId] = useState<string | null>(null);
  // New: track which source to play (quiz set id, "flashcards", "all", or null for browse)
  const [selectedPlaySource, setSelectedPlaySource] = useState<string | null>(null);
  const [showGameModeSelect, setShowGameModeSelect] = useState(false);

  // Theme colors
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = primaryColor;
  const dropdownBg = isDark ? "#3D3D3D" : "#FFFFFF";
  const hoverBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";

  // Filter flashcards by subject
  const filteredFlashcards = selectedSubjectFilter === "all"
    ? flashcards
    : flashcards.filter(f => f.subjectId === selectedSubjectFilter);

  const dueCards = selectedSubjectFilter === "all"
    ? dueForReview
    : dueForReview.filter(f => f.subjectId === selectedSubjectFilter);

  // Handle share quiz (specific set or all questions)
  const handleShareQuiz = async (title: string, expiryDays: number) => {
    // Decide which questions to share
    let questionsToShare;
    let description: string;

    if (shareSetId) {
      // Share a specific quiz set
      const setQuestions = quizQuestions.filter(q => q.quizSetId === shareSetId);
      const set = quizSets.find(s => s.id === shareSetId);
      questionsToShare = setQuestions.map(q => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        wrongAnswers: q.wrongAnswers || [],
        difficulty: q.difficulty || ("medium" as const),
        explanation: q.explanation || "",
      }));
      description = set?.description || `ชุดข้อสอบ: ${title}`;
    } else {
      // Share all quiz questions (skip flashcards with no wrongAnswers)
      questionsToShare = quizQuestions.map(q => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        wrongAnswers: q.wrongAnswers || [],
        difficulty: q.difficulty || ("medium" as const),
        explanation: q.explanation || "",
      }));
      description = `ข้อสอบจาก ${userProfile?.displayName || "ผู้ใช้"} - ${quizQuestions.length} คำถาม`;
    }

    if (questionsToShare.length === 0) {
      alert("ไม่มีคำถามที่จะแชร์");
      return;
    }

    const totalQuestions = questionsToShare.length;

    // Determine overall difficulty
    const difficulties = questionsToShare.map(q => q.difficulty);
    const difficulty = difficulties.length > 0
      ? difficulties.every(d => d === difficulties[0])
        ? difficulties[0]
        : "mixed"
      : "medium";

    const result = await shareQuiz(
      userProfile?.displayName || "ผู้ใช้",
      shareSetId || "all",
      title,
      totalQuestions,
      expiryDays,
      {
        questions: questionsToShare,
        description,
        difficulty: difficulty as "easy" | "medium" | "hard" | "mixed",
      }
    );
    
    if (result) {
      const shareUrl = `${window.location.origin}/portal?code=${result.shareCode}`;
      setShareResult({
        shareCode: result.shareCode,
        shareUrl,
      });
    }
  };

  // Helper: get cards for a given source
  const getCardsForSource = (source: string | null) => {
    if (source === "flashcards") {
      return (dueCards.length > 0 ? dueCards : filteredFlashcards).map(f => ({
        id: f.id,
        front: f.question,
        back: f.answer,
        subjectId: f.subjectId,
        wrongAnswers: [] as string[],
        source: "flashcard" as const,
      }));
    }

    if (source && source !== "all") {
      // Specific quiz set
      const setQuestions = quizQuestions.filter(q => q.quizSetId === source);
      return setQuestions.map(q => ({
        id: q.id,
        front: q.question,
        back: q.correctAnswer,
        subjectId: q.subjectId,
        wrongAnswers: q.wrongAnswers || [],
        source: "quiz" as const,
      }));
    }

    // "all" - combine everything
    const flashcardsAsCards = (dueCards.length > 0 ? dueCards : filteredFlashcards).map(f => ({
      id: f.id,
      front: f.question,
      back: f.answer,
      subjectId: f.subjectId,
      wrongAnswers: [] as string[],
      source: "flashcard" as const,
    }));
    const filteredQuizQuestions = selectedSubjectFilter !== "all"
      ? quizQuestions.filter(q => q.subjectId === selectedSubjectFilter)
      : quizQuestions;
    const quizQuestionsAsCards = filteredQuizQuestions.map(q => ({
      id: q.id,
      front: q.question,
      back: q.correctAnswer,
      subjectId: q.subjectId,
      wrongAnswers: q.wrongAnswers || [],
      source: "quiz" as const,
    }));
    return [...flashcardsAsCards, ...quizQuestionsAsCards];
  };

  // Start a game with a specific source
  const startGame = (mode: "quiz" | "memory" | "speed", source?: string | null) => {
    const sourceToUse = source ?? selectedPlaySource ?? "all";
    const allCards = getCardsForSource(sourceToUse);

    if (allCards.length < 4) {
      alert("ต้องมีการ์ดหรือคำถามอย่างน้อย 4 ข้อเพื่อเริ่มเกม");
      return;
    }

    // Shuffle cards
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const gameCards = shuffled.slice(0, Math.min(10, shuffled.length));

    setGameState({
      mode,
      isPlaying: true,
      currentQuestion: 0,
      score: 0,
      totalQuestions: gameCards.length,
      correctAnswers: 0,
      timeLeft: mode === "speed" ? 60 : 0,
      startTime: new Date(),
      cards: gameCards.map(c => ({
        id: c.id,
        front: c.front,
        back: c.back,
        subjectId: c.subjectId,
        wrongAnswers: c.wrongAnswers,
        source: c.source,
      })),
    });
    setShowGameModeSelect(false);
    setSelectedPlaySource(null);
  };

  // End game and save results
  const endGame = async () => {
    if (gameState.startTime && gameState.mode) {
      const duration = Math.floor((new Date().getTime() - gameState.startTime.getTime()) / 1000);
      await addSession({
        gameMode: gameState.mode,
        score: gameState.score,
        totalQuestions: gameState.totalQuestions,
        correctAnswers: gameState.correctAnswers,
        duration,
        ...(selectedSubjectFilter !== "all" ? { subjectId: selectedSubjectFilter } : {}),
      });
    }

    setGameState({
      mode: null,
      isPlaying: false,
      currentQuestion: 0,
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      timeLeft: 60,
      startTime: null,
      cards: [],
    });
  };

  // Answer handler
  const handleAnswer = async (correct: boolean) => {
    const currentCard = gameState.cards[gameState.currentQuestion];

    // Only update flashcard stats if it's a flashcard (not a quiz question)
    if (currentCard.source === "flashcard" || !currentCard.source) {
      try {
        await reviewFlashcard(currentCard.id, correct ? 4 : 1);
      } catch (err) {
        console.warn("Could not update flashcard:", err);
      }
    }

    const newScore = correct ? gameState.score + (gameState.mode === "speed" ? 100 : 10) : gameState.score;
    const newCorrect = correct ? gameState.correctAnswers + 1 : gameState.correctAnswers;

    setGameState(prev => ({
      ...prev,
      score: newScore,
      correctAnswers: newCorrect,
      currentQuestion: prev.currentQuestion + 1,
    }));
  };

  // Speed game timer
  useEffect(() => {
    if (gameState.mode === "speed" && gameState.isPlaying && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.mode, gameState.isPlaying, gameState.timeLeft]);

  // If playing, show game screen
  if (gameState.isPlaying && gameState.mode) {
    return (
      <GameScreen
        gameState={gameState}
        onAnswer={handleAnswer}
        onEnd={endGame}
      />
    );
  }

  // Game over screen
  if (gameState.currentQuestion >= gameState.totalQuestions && gameState.totalQuestions > 0) {
    return (
      <GameOverScreen
        gameState={gameState}
        onPlayAgain={() => startGame(gameState.mode!)}
        onExit={endGame}
      />
    );
  }

  const gameModes = [
    {
      id: "quiz" as const,
      name: "Quiz Battle",
      desc: "ตอบคำถาม เก็บคะแนน",
      detail: "ตอบคำถามจากการ์ด ยิ่งตอบถูกเยอะ คะแนนยิ่งสูง!",
      icon: Target,
      color: isDark ? "#3D2A4D" : "#E8D5F2",
      iconBg: "#8B5CF6"
    },
    {
      id: "memory" as const,
      name: "Memory Match",
      desc: "จับคู่คำตอบ",
      detail: "เห็นคำถาม แล้วเลือกคำตอบที่ถูกต้อง",
      icon: Brain,
      color: isDark ? "#2A3A4D" : "#C5E8FF",
      iconBg: primaryColor
    },
    {
      id: "speed" as const,
      name: "Speed Challenge",
      desc: "แข่งกับเวลา",
      detail: "ตอบให้เร็วที่สุดภายใน 60 วินาที!",
      icon: Zap,
      color: isDark ? "#4D3A2A" : "#FFE4C9",
      iconBg: "#F97316"
    },
  ];

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
            <ClockTimerWidget size={180} />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Header Card */}
            <FolderCard title="ทบทวนเนื้อหา">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" style={{ color: primaryColor }} />
                <p className="font-kanit" style={{ color: textMuted }}>
                  มีการ์ดรอทบทวน{" "}
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {dueCards.length} ใบ
                  </span>
                </p>
              </div>
            </FolderCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              <StatsCard value={flashcards.length} label="การ์ดทั้งหมด" />
              <StatsCard value={stats?.totalSessions || 0} label="ครั้งที่เล่น" />
              <StatsCard value={`${stats?.accuracy || 0}%`} label="ความแม่นยำ" />
            </div>

            {/* Share Quiz Button */}
            {(flashcards.length > 0 || quizQuestions.length > 0) && (
              <motion.button
                onClick={() => {
                  setShareResult(null);
                  setShowShareModal(true);
                }}
                className="w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-3"
                style={{
                  backgroundColor: isDark ? "#2A3A4D" : "#E8F4FF",
                  borderColor: primaryColor,
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-kanit font-bold" style={{ color: textColor }}>
                    แชร์ข้อสอบให้เพื่อน
                  </p>
                  <p className="font-kanit text-xs" style={{ color: textMuted }}>
                    สร้างลิงก์เพื่อให้เพื่อนทำข้อสอบของคุณ
                  </p>
                </div>
              </motion.button>
            )}

            {/* === Quiz Sets & Play Section === */}
            <FolderCard title="ชุดข้อสอบ">
              {/* Game Mode Selection Modal (overlay within the card flow) */}
              <AnimatePresence>
                {showGameModeSelect && selectedPlaySource && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="rounded-2xl border-2 p-4" style={{ backgroundColor: isDark ? "#2A2A2A" : "#FAFAFA", borderColor: primaryColor }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => { setShowGameModeSelect(false); setSelectedPlaySource(null); }}
                            className="p-1.5 rounded-lg"
                            style={{ color: textMuted }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </motion.button>
                          <h4 className="font-kanit font-bold" style={{ color: textColor }}>
                            เลือกโหมดเกม
                          </h4>
                        </div>
                        <span className="font-kanit text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                          {getCardsForSource(selectedPlaySource).length} ข้อ
                        </span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        {gameModes.map((mode) => {
                          const cardCount = getCardsForSource(selectedPlaySource).length;
                          return (
                            <motion.button
                              key={mode.id}
                              onClick={() => startGame(mode.id, selectedPlaySource)}
                              disabled={cardCount < 4}
                              className="p-4 rounded-2xl border-2 text-left relative overflow-hidden"
                              style={{
                                backgroundColor: mode.color,
                                borderColor,
                                opacity: cardCount < 4 ? 0.5 : 1,
                              }}
                              whileHover={{ scale: cardCount >= 4 ? 1.02 : 1 }}
                              whileTap={{ scale: cardCount >= 4 ? 0.98 : 1 }}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                                  style={{ backgroundColor: mode.iconBg }}
                                >
                                  <mode.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-kanit font-bold" style={{ color: textColor }}>{mode.name}</h4>
                                  <p className="font-kanit text-xs" style={{ color: textMuted }}>{mode.desc}</p>
                                </div>
                              </div>
                              <p className="font-kanit text-xs" style={{ color: textMuted }}>
                                {mode.detail}
                              </p>
                              {cardCount < 4 && (
                                <p className="font-kanit text-xs mt-1" style={{ color: "#EF4444" }}>
                                  ต้องมีอย่างน้อย 4 ข้อ
                                </p>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Play All Button */}
              {(() => {
                const filteredQuizQ = selectedSubjectFilter !== "all"
                  ? quizQuestions.filter(q => q.subjectId === selectedSubjectFilter)
                  : quizQuestions;
                const totalAvailable = filteredFlashcards.length + filteredQuizQ.length;
                return totalAvailable > 0 ? (
                  <motion.button
                    onClick={() => { setSelectedPlaySource("all"); setShowGameModeSelect(true); }}
                    className="w-full mb-4 p-4 rounded-2xl border-2 flex items-center gap-4"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${isDark ? '#0080C0' : '#4FADDB'} 100%)`,
                      borderColor: primaryColor,
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-kanit font-bold text-white">
                        เล่นทั้งหมด
                      </h4>
                      <p className="font-kanit text-xs text-white/80">
                        รวมการ์ด + ข้อสอบทุกชุด ({totalAvailable} ข้อ)
                      </p>
                    </div>
                    <Play className="w-6 h-6 text-white" />
                  </motion.button>
                ) : null;
              })()}

              {/* Flashcards Play Card */}
              {filteredFlashcards.length > 0 && (
                <motion.div
                  className="mb-3 rounded-2xl border-2 overflow-hidden"
                  style={{ backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF", borderColor: isDark ? "#404040" : "#E5E5E5" }}
                  whileHover={{ y: -2 }}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isDark ? "#3D2A4D" : "#E8D5F2" }}
                    >
                      <Brain className="w-6 h-6" style={{ color: "#8B5CF6" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-kanit font-bold text-sm truncate" style={{ color: textColor }}>
                        การ์ด Flashcard
                      </h4>
                      <p className="font-kanit text-xs" style={{ color: textMuted }}>
                        {dueCards.length > 0 ? `${dueCards.length} ใบรอทบทวน` : `${filteredFlashcards.length} ใบ`}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => { setSelectedPlaySource("flashcards"); setShowGameModeSelect(true); }}
                      className="px-4 py-2 rounded-xl font-kanit text-sm text-white flex items-center gap-2 flex-shrink-0"
                      style={{ backgroundColor: "#8B5CF6" }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-4 h-4" />
                      เล่น
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Quiz Sets as Playable Cards */}
              {quizSets.length > 0 && (
                <div className="space-y-3">
                  {quizSets.map((set) => {
                    const setQuestions = quizQuestions.filter(q => q.quizSetId === set.id);
                    const isExpanded = managingSetId === set.id;
                    const isEditingSet = editSetForm !== null && managingSetId === set.id && editingQuestionId === null;

                    // Determine overall difficulty
                    const difficulties = setQuestions.map(q => q.difficulty);
                    const setDifficulty = difficulties.length > 0
                      ? difficulties.every(d => d === difficulties[0])
                        ? difficulties[0]
                        : "mixed"
                      : "medium";
                    const difficultyLabels: Record<string, string> = { easy: "ง่าย", medium: "ปานกลาง", hard: "ยาก", mixed: "คละระดับ" };
                    const difficultyColors: Record<string, { bg: string; text: string }> = {
                      easy: { bg: "#D4F5D4", text: "#166534" },
                      medium: { bg: "#FEF3C7", text: "#92400E" },
                      hard: { bg: "#FEE2E2", text: "#991B1B" },
                      mixed: { bg: "#E0E7FF", text: "#3730A3" },
                    };
                    const diffStyle = difficultyColors[setDifficulty] || difficultyColors.mixed;

                    return (
                      <motion.div
                        key={set.id}
                        className="rounded-2xl border-2 overflow-hidden"
                        style={{ backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF", borderColor: isDark ? "#404040" : "#E5E5E5" }}
                        whileHover={{ y: -2 }}
                      >
                        {/* Set Header - Portal-style */}
                        <div
                          className="p-4"
                          style={{ background: `linear-gradient(135deg, ${primaryColor}18 0%, ${primaryColor}08 100%)` }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${primaryColor}20` }}
                            >
                              <FolderOpen className="w-6 h-6" style={{ color: primaryColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              {isEditingSet ? (
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={editSetForm?.name || ""}
                                    onChange={e => setEditSetForm(prev => prev ? {...prev, name: e.target.value} : null)}
                                    className="flex-1 px-2 py-1 rounded-lg border font-kanit text-sm focus:outline-none"
                                    style={{ backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF", borderColor: primaryColor, color: textColor }}
                                  />
                                  <motion.button
                                    onClick={async () => {
                                      if (editSetForm) {
                                        await editQuizSet(set.id, { name: editSetForm.name, description: editSetForm.description });
                                        setEditSetForm(null);
                                      }
                                    }}
                                    className="p-1 rounded-lg" style={{ backgroundColor: primaryColor }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Save className="w-4 h-4 text-white" />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => setEditSetForm(null)}
                                    className="p-1 rounded-lg" style={{ backgroundColor: isDark ? "#555" : "#DDD" }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <X className="w-4 h-4" style={{ color: textColor }} />
                                  </motion.button>
                                </div>
                              ) : (
                                <>
                                  <h4 className="font-kanit font-bold text-sm truncate" style={{ color: textColor }}>
                                    {set.name}
                                  </h4>
                                  {set.description && (
                                    <p className="font-kanit text-xs truncate" style={{ color: textMuted }}>{set.description}</p>
                                  )}
                                </>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="font-kanit text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                                  {setQuestions.length} ข้อ
                                </span>
                                <span className="font-kanit text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: diffStyle.bg, color: diffStyle.text }}>
                                  {difficultyLabels[setDifficulty] || setDifficulty}
                                </span>
                                {set.source && (
                                  <span className="font-kanit text-xs" style={{ color: textMuted }}>
                                    {set.source === "ai" ? "🤖 AI" : "📄 CSV"}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Play button */}
                            <motion.button
                              onClick={() => { setSelectedPlaySource(set.id); setShowGameModeSelect(true); }}
                              disabled={setQuestions.length < 4}
                              className="px-4 py-2 rounded-xl font-kanit text-sm text-white flex items-center gap-2 flex-shrink-0 disabled:opacity-40"
                              style={{ backgroundColor: primaryColor }}
                              whileHover={{ scale: setQuestions.length >= 4 ? 1.05 : 1 }}
                              whileTap={{ scale: setQuestions.length >= 4 ? 0.95 : 1 }}
                            >
                              <Play className="w-4 h-4" />
                              เล่น
                            </motion.button>
                          </div>
                        </div>

                        {/* Set Actions */}
                        <div className="px-4 py-2 flex gap-2 border-t" style={{ borderColor: isDark ? "#404040" : "#E5E5E5" }}>
                          <motion.button
                            onClick={() => setManagingSetId(isExpanded ? null : set.id)}
                            className="px-3 py-1 rounded-lg font-kanit text-xs flex items-center gap-1"
                            style={{ backgroundColor: isDark ? "#3D3D3D" : "#F0F0F0", color: textMuted }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            {isExpanded ? "ซ่อนคำถาม" : "ดูคำถาม"}
                          </motion.button>
                          <motion.button
                            onClick={() => { setEditSetForm({ name: set.name, description: set.description || "" }); setEditingQuestionId(null); setManagingSetId(set.id); }}
                            className="px-3 py-1 rounded-lg font-kanit text-xs flex items-center gap-1"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit2 className="w-3 h-3" /> แก้ไข
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setShareSetId(set.id);
                              setShareResult(null);
                              setShowShareModal(true);
                            }}
                            className="px-3 py-1 rounded-lg font-kanit text-xs flex items-center gap-1"
                            style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22C55E" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Share2 className="w-3 h-3" /> แชร์
                          </motion.button>
                          <motion.button
                            onClick={async () => {
                              if (confirm(`ลบชุด "${set.name}" และคำถามทั้งหมด?`)) {
                                await removeQuizSet(set.id);
                                setManagingSetId(null);
                              }
                            }}
                            className="px-3 py-1 rounded-lg font-kanit text-xs flex items-center gap-1"
                            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="w-3 h-3" /> ลบ
                          </motion.button>
                        </div>

                        {/* Expanded Questions List */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="max-h-64 overflow-y-auto">
                                {setQuestions.map((q, i) => (
                                  <div
                                    key={q.id}
                                    className="px-4 py-2 border-t flex items-start gap-2"
                                    style={{ borderColor: isDark ? "#404040" : "#E5E5E5" }}
                                  >
                                    {editingQuestionId === q.id && editForm ? (
                                      <div className="flex-1 space-y-2">
                                        <input
                                          type="text"
                                          value={editForm.question}
                                          onChange={e => setEditForm(prev => prev ? {...prev, question: e.target.value} : null)}
                                          className="w-full px-2 py-1 rounded-lg border font-kanit text-sm focus:outline-none"
                                          style={{ backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF", borderColor: primaryColor, color: textColor }}
                                          placeholder="คำถาม"
                                        />
                                        <input
                                          type="text"
                                          value={editForm.correctAnswer}
                                          onChange={e => setEditForm(prev => prev ? {...prev, correctAnswer: e.target.value} : null)}
                                          className="w-full px-2 py-1 rounded-lg border font-kanit text-xs focus:outline-none"
                                          style={{ backgroundColor: "rgba(34, 197, 94, 0.05)", borderColor: "#22C55E", color: textColor }}
                                          placeholder="คำตอบที่ถูก"
                                        />
                                        {editForm.wrongAnswers.map((wa, wi) => (
                                          <input
                                            key={wi}
                                            type="text"
                                            value={wa}
                                            onChange={e => {
                                              const newWrong = [...editForm.wrongAnswers];
                                              newWrong[wi] = e.target.value;
                                              setEditForm(prev => prev ? {...prev, wrongAnswers: newWrong} : null);
                                            }}
                                            className="w-full px-2 py-1 rounded-lg border font-kanit text-xs focus:outline-none"
                                            style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", borderColor: "#EF4444", color: textColor }}
                                            placeholder={`คำตอบผิด ${wi + 1}`}
                                          />
                                        ))}
                                        <div className="flex gap-2">
                                          <select
                                            value={editForm.difficulty}
                                            onChange={e => setEditForm(prev => prev ? {...prev, difficulty: e.target.value} : null)}
                                            className="px-2 py-1 rounded-lg border font-kanit text-xs focus:outline-none"
                                            style={{ backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF", borderColor: primaryColor, color: textColor }}
                                          >
                                            <option value="easy">ง่าย</option>
                                            <option value="medium">กลาง</option>
                                            <option value="hard">ยาก</option>
                                          </select>
                                          <motion.button
                                            onClick={async () => {
                                              await editQuestion(q.id, {
                                                question: editForm.question,
                                                correctAnswer: editForm.correctAnswer,
                                                wrongAnswers: editForm.wrongAnswers,
                                                difficulty: editForm.difficulty as "easy" | "medium" | "hard",
                                              });
                                              setEditingQuestionId(null);
                                              setEditForm(null);
                                            }}
                                            className="px-3 py-1 rounded-lg font-kanit text-xs text-white"
                                            style={{ backgroundColor: primaryColor }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <Save className="w-3 h-3 inline mr-1" />บันทึก
                                          </motion.button>
                                          <motion.button
                                            onClick={() => { setEditingQuestionId(null); setEditForm(null); }}
                                            className="px-3 py-1 rounded-lg font-kanit text-xs"
                                            style={{ backgroundColor: isDark ? "#555" : "#DDD", color: textColor }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            ยกเลิก
                                          </motion.button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="font-kanit text-xs mt-0.5 flex-shrink-0" style={{ color: textMuted }}>{i + 1}.</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-kanit text-sm truncate" style={{ color: textColor }}>{q.question}</p>
                                          <p className="font-kanit text-xs" style={{ color: "#22C55E" }}>✓ {q.correctAnswer}</p>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                          <motion.button
                                            onClick={() => {
                                              setEditingQuestionId(q.id);
                                              setEditForm({
                                                question: q.question,
                                                correctAnswer: q.correctAnswer,
                                                wrongAnswers: [...q.wrongAnswers],
                                                difficulty: q.difficulty,
                                              });
                                            }}
                                            className="p-1 rounded-lg"
                                            style={{ color: primaryColor }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </motion.button>
                                          <motion.button
                                            onClick={async () => {
                                              if (confirm("ลบคำถามนี้?")) await removeQuestion(q.id);
                                            }}
                                            className="p-1 rounded-lg"
                                            style={{ color: "#EF4444" }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </motion.button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Ungrouped Questions */}
              {(() => {
                const ungrouped = quizQuestions.filter(q => !q.quizSetId);
                if (ungrouped.length === 0) return null;
                return (
                  <motion.div
                    className="mt-3 rounded-2xl border-2 overflow-hidden"
                    style={{ backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF", borderColor: isDark ? "#404040" : "#E5E5E5" }}
                  >
                    <div className="p-4 flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isDark ? "#3D3D3D" : "#F0F0F0" }}
                      >
                        <BookOpen className="w-6 h-6" style={{ color: textMuted }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-kanit font-bold text-sm" style={{ color: textColor }}>
                          คำถามที่ไม่จัดกลุ่ม
                        </h4>
                        <p className="font-kanit text-xs" style={{ color: textMuted }}>
                          {ungrouped.length} ข้อ
                        </p>
                      </div>
                      <motion.button
                        onClick={() => setManagingSetId(managingSetId === "__ungrouped" ? null : "__ungrouped")}
                        className="px-3 py-1 rounded-lg font-kanit text-xs flex items-center gap-1"
                        style={{ backgroundColor: isDark ? "#3D3D3D" : "#F0F0F0", color: textMuted }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRight className={`w-3 h-3 transition-transform ${managingSetId === "__ungrouped" ? "rotate-90" : ""}`} />
                        {managingSetId === "__ungrouped" ? "ซ่อน" : "ดู"}
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {managingSetId === "__ungrouped" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden max-h-64 overflow-y-auto"
                        >
                          {ungrouped.map((q, i) => (
                            <div
                              key={q.id}
                              className="px-4 py-2 border-t flex items-start gap-2"
                              style={{ borderColor: isDark ? "#404040" : "#E5E5E5" }}
                            >
                              <span className="font-kanit text-xs mt-0.5 flex-shrink-0" style={{ color: textMuted }}>{i + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-kanit text-sm truncate" style={{ color: textColor }}>{q.question}</p>
                                <p className="font-kanit text-xs" style={{ color: "#22C55E" }}>✓ {q.correctAnswer}</p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <motion.button
                                  onClick={() => {
                                    setEditingQuestionId(q.id);
                                    setEditForm({
                                      question: q.question,
                                      correctAnswer: q.correctAnswer,
                                      wrongAnswers: [...q.wrongAnswers],
                                      difficulty: q.difficulty,
                                    });
                                    setManagingSetId("__ungrouped");
                                  }}
                                  className="p-1 rounded-lg"
                                  style={{ color: primaryColor }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </motion.button>
                                <motion.button
                                  onClick={async () => {
                                    if (confirm("ลบคำถามนี้?")) await removeQuestion(q.id);
                                  }}
                                  className="p-1 rounded-lg"
                                  style={{ color: "#EF4444" }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}

              {/* Empty State */}
              {quizSets.length === 0 && flashcards.length === 0 && quizQuestions.length === 0 && (
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 mx-auto mb-2" style={{ color: textMuted }} />
                  <p className="font-kanit text-sm" style={{ color: textMuted }}>
                    ยังไม่มีชุดข้อสอบ ลองสร้างด้วย AI หรือ Import CSV
                  </p>
                </div>
              )}
            </FolderCard>

            {/* AI Quiz Tools */}
            <FolderCard title="เครื่องมือสร้างโจทย์">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* AI Generator Button */}
                <motion.button
                  onClick={() => setShowAIGenerator(true)}
                  className="p-4 rounded-xl border-2 text-left flex items-center gap-3"
                  style={{
                    backgroundColor: isDark ? "#2A3D4D" : "#E0F2FE",
                    borderColor: primaryColor,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-kanit font-bold" style={{ color: textColor }}>
                      AI สร้างโจทย์
                    </h4>
                    <p className="font-kanit text-xs" style={{ color: textMuted }}>
                      ใช้ Gemini AI สร้างคำถามจากหลักสูตร
                    </p>
                  </div>
                </motion.button>

                {/* CSV Import Button */}
                <motion.button
                  onClick={() => setShowCSVImport(true)}
                  className="p-4 rounded-xl border-2 text-left flex items-center gap-3"
                  style={{
                    backgroundColor: isDark ? "#3D4D2A" : "#ECFCCB",
                    borderColor: "#84CC16",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#84CC16" }}
                  >
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-kanit font-bold" style={{ color: textColor }}>
                      Import CSV
                    </h4>
                    <p className="font-kanit text-xs" style={{ color: textMuted }}>
                      นำเข้าคำถามจากไฟล์ CSV ของคุณ
                    </p>
                  </div>
                </motion.button>
              </div>

              {/* AI Questions Summary */}
              {quizQuestions.length > 0 && (
                <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: isDark ? "#3D3D3D" : "#F8F8F8" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" style={{ color: primaryColor }} />
                      <span className="font-kanit text-sm" style={{ color: textColor }}>
                        คำถาม AI/CSV: <span className="font-bold">{quizQuestions.length}</span> ข้อ
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-kanit text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        ง่าย: {quizQuestions.filter(q => q.difficulty === "easy").length}
                      </span>
                      <span className="font-kanit text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                        กลาง: {quizQuestions.filter(q => q.difficulty === "medium").length}
                      </span>
                      <span className="font-kanit text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        ยาก: {quizQuestions.filter(q => q.difficulty === "hard").length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </FolderCard>

            {/* Flashcards Section */}
            <FolderCard
              title="การ์ดของฉัน"
              headerAction={
                <div className="flex items-center gap-2">
                  {/* Subject Filter */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg font-kanit text-sm text-white"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selectedSubjectFilter === "all"
                        ? "ทุกวิชา"
                        : subjects.find(s => s.id === selectedSubjectFilter)?.name || "ทุกวิชา"}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showSubjectDropdown ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {showSubjectDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-1 w-40 rounded-xl border-2 overflow-hidden z-50"
                          style={{ backgroundColor: dropdownBg, borderColor }}
                        >
                          <button
                            onClick={() => {
                              setSelectedSubjectFilter("all");
                              setShowSubjectDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left font-kanit text-sm flex items-center gap-2 transition-colors"
                            style={{
                              color: textColor,
                              backgroundColor: selectedSubjectFilter === "all" ? hoverBg : "transparent"
                            }}
                          >
                            {selectedSubjectFilter === "all" && <Check className="w-3 h-3" />}
                            ทุกวิชา
                          </button>
                          {subjects.map((subject) => (
                            <button
                              key={subject.id}
                              onClick={() => {
                                setSelectedSubjectFilter(subject.id);
                                setShowSubjectDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left font-kanit text-sm flex items-center gap-2 transition-colors"
                              style={{
                                color: textColor,
                                backgroundColor: selectedSubjectFilter === subject.id ? hoverBg : "transparent"
                              }}
                            >
                              {selectedSubjectFilter === subject.id && <Check className="w-3 h-3" />}
                              {subject.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Add Card Button */}
                  <motion.button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg font-kanit text-sm text-white"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่ม
                  </motion.button>
                </div>
              }
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                </div>
              ) : filteredFlashcards.length > 0 ? (
                <div className="space-y-2">
                  {filteredFlashcards.slice(0, 10).map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: isDark ? "#3D3D3D" : "#F8F8F8" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-kanit text-sm lg:text-base font-medium truncate" style={{ color: textColor }}>
                          {card.question}
                        </p>
                        <p className="font-kanit text-xs truncate" style={{ color: textMuted }}>
                          {card.answer}
                        </p>
                      </div>

                      <motion.button
                        onClick={() => removeFlashcard(card.id)}
                        className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                        style={{ color: textMuted }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto mb-2" style={{ color: textMuted }} />
                  <p className="font-kanit text-sm" style={{ color: textMuted }}>
                    ยังไม่มีการ์ด เพิ่มการ์ดเพื่อเริ่มทบทวน!
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
                <span className="font-kanit text-sm">เพิ่มการ์ดใหม่</span>
              </motion.button>
            </FolderCard>
          </div>
        </div>
      </div>

      {/* Add Flashcard Modal */}
      <AddFlashcardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (data) => {
          await addFlashcard({
            question: data.front,
            answer: data.back,
            subjectId: data.subjectId || "",
          });
        }}
        subjects={subjects}
      />

      {/* AI Quiz Generator Modal */}
      <AIQuizGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        subjects={subjects}
        flashcards={flashcards}
        onGenerate={async (questions) => {
          await addQuestions(questions.map(q => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            wrongAnswers: q.wrongAnswers,
            difficulty: q.difficulty,
            subjectId: q.subjectId,
            subjectName: q.subjectName,
            topic: q.topic,
            explanation: q.explanation,
            source: q.source,
          })));
        }}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        subjects={subjects}
        onImport={async (setInfo, questions) => {
          await addQuizSet(
            {
              name: setInfo.name,
              description: setInfo.description,
              subjectId: setInfo.subjectId,
              subjectName: setInfo.subjectName,
              source: "csv",
            },
            questions.map(q => ({
              question: q.question,
              correctAnswer: q.correctAnswer,
              wrongAnswers: q.wrongAnswers,
              difficulty: q.difficulty,
              subjectId: q.subjectId,
              subjectName: q.subjectName,
              topic: q.topic,
              explanation: q.explanation,
              source: q.source,
            }))
          );
        }}
      />

      {/* Share Quiz Modal */}
      <ShareQuizModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setShareResult(null);
          setShareSetId(null);
        }}
        flashcardCount={shareSetId ? 0 : flashcards.length}
        quizQuestionCount={shareSetId
          ? quizQuestions.filter(q => q.quizSetId === shareSetId).length
          : quizQuestions.length}
        onShare={handleShareQuiz}
        loading={shareLoading}
        shareResult={shareResult}
      />
    </div>
  );
}

// Game Screen Component
function GameScreen({
  gameState,
  onAnswer,
  onEnd
}: {
  gameState: GameState;
  onAnswer: (correct: boolean) => void;
  onEnd: () => void;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";

  const currentCard = gameState.cards[gameState.currentQuestion];
  const isGameOver = gameState.currentQuestion >= gameState.totalQuestions ||
    (gameState.mode === "speed" && gameState.timeLeft <= 0);

  // Generate multiple choice options using useMemo to avoid setState in effect
  const computedOptions = useMemo(() => {
    if (currentCard && gameState.mode !== "quiz") {
      const correctAnswer = currentCard.back;

      // Prefer pre-defined wrong answers (from CSV/AI questions)
      let wrongAnswers: string[];
      if (currentCard.wrongAnswers && currentCard.wrongAnswers.length >= 3) {
        wrongAnswers = currentCard.wrongAnswers.slice(0, 3);
      } else {
        // Fallback: use other cards' answers
        const otherCards = gameState.cards.filter(c => c.id !== currentCard.id);
        wrongAnswers = otherCards
          .slice(0, 3)
          .map(c => c.back);
      }

      // Shuffle options deterministically based on currentQuestion
      const allOptions = [correctAnswer, ...wrongAnswers];
      // Simple shuffle based on question index
      const shuffled = allOptions.sort((a, b) => {
        const hash = (s: string) => s.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return (hash(a) + gameState.currentQuestion) % 10 - (hash(b) + gameState.currentQuestion) % 10;
      });
      return shuffled;
    }
    return [];
  }, [currentCard, gameState.mode, gameState.cards, gameState.currentQuestion]);

  // Use computedOptions directly - no need for separate state
  const activeOptions = computedOptions;

  // Handle quiz mode (show card, flip to see answer)
  const handleFlip = () => {
    setShowAnswer(true);
  };

  const handleSelfGrade = (correct: boolean) => {
    onAnswer(correct);
    setShowAnswer(false);
  };

  // Handle multiple choice
  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const isCorrect = activeOptions[index] === currentCard.back;

    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedOption(null);
    }, 1000);
  };

  if (isGameOver) {
    return (
      <GameOverScreen
        gameState={gameState}
        onPlayAgain={() => { }}
        onExit={onEnd}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: pageBg }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b-2"
        style={{ borderColor }}
      >
        <div className="flex items-center gap-4">
          <span className="font-kanit text-sm" style={{ color: textMuted }}>
            {gameState.currentQuestion + 1} / {gameState.totalQuestions}
          </span>
          {gameState.mode === "speed" && (
            <span className="font-mono font-bold text-lg text-orange-500">
              {gameState.timeLeft}s
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="font-kanit font-bold" style={{ color: primaryColor }}>
            🏆 {gameState.score}
          </span>
          <motion.button
            onClick={onEnd}
            className="p-2 rounded-full"
            style={{ color: textMuted }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {gameState.mode === "quiz" ? (
          // Quiz mode - Flashcard flip
          <div className="w-full max-w-md">
            <motion.div
              className="relative w-full aspect-[3/2] cursor-pointer"
              onClick={!showAnswer ? handleFlip : undefined}
            >
              <motion.div
                className="w-full h-full rounded-2xl border-2 p-6 flex flex-col items-center justify-center"
                style={{ backgroundColor: cardBg, borderColor }}
                animate={{ rotateY: showAnswer ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {!showAnswer ? (
                  <div className="text-center">
                    <p className="font-kanit text-lg lg:text-xl font-medium mb-4" style={{ color: textColor }}>
                      {currentCard.front}
                    </p>
                    <p className="font-kanit text-sm" style={{ color: textMuted }}>
                      แตะเพื่อดูคำตอบ
                    </p>
                  </div>
                ) : (
                  <div className="text-center" style={{ transform: "rotateY(180deg)" }}>
                    <p className="font-kanit text-lg lg:text-xl font-medium mb-6" style={{ color: textColor }}>
                      {currentCard.back}
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => handleSelfGrade(false)}
                        className="px-6 py-3 rounded-xl border-2 font-kanit"
                        style={{
                          backgroundColor: isDark ? "#5C3A3A" : "#FFD6E0",
                          borderColor,
                          color: textColor
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-5 h-5 inline mr-2" />
                        ไม่ถูก
                      </motion.button>
                      <motion.button
                        onClick={() => handleSelfGrade(true)}
                        className="px-6 py-3 rounded-xl border-2 font-kanit"
                        style={{
                          backgroundColor: isDark ? "#354D35" : "#D4F5D4",
                          borderColor,
                          color: textColor
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Check className="w-5 h-5 inline mr-2" />
                        ถูกต้อง
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        ) : (
          // Memory/Speed mode - Multiple choice
          <div className="w-full max-w-md space-y-6">
            <div
              className="rounded-2xl border-2 p-6 text-center"
              style={{ backgroundColor: cardBg, borderColor }}
            >
              <p className="font-kanit text-lg lg:text-xl font-medium" style={{ color: textColor }}>
                {currentCard.front}
              </p>
            </div>

            <div className="space-y-3">
              {activeOptions.map((option, index) => {
                const isCorrect = option === currentCard.back;
                const isSelected = selectedOption === index;

                let bgColor = cardBg;
                if (selectedOption !== null) {
                  if (isCorrect) bgColor = isDark ? "#354D35" : "#D4F5D4";
                  else if (isSelected) bgColor = isDark ? "#5C3A3A" : "#FFD6E0";
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    disabled={selectedOption !== null}
                    className="w-full p-4 rounded-xl border-2 text-left font-kanit"
                    style={{ backgroundColor: bgColor, borderColor, color: textColor }}
                    whileHover={{ scale: selectedOption === null ? 1.02 : 1 }}
                    whileTap={{ scale: selectedOption === null ? 0.98 : 1 }}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Game Over Screen
function GameOverScreen({
  gameState,
  onPlayAgain,
  onExit,
}: {
  gameState: GameState;
  onPlayAgain: () => void;
  onExit: () => void;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";

  const accuracy = gameState.totalQuestions > 0
    ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: pageBg }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border-2 p-8 text-center"
        style={{ backgroundColor: cardBg, borderColor }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-6xl mb-4"
        >
          {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "⭐" : "💪"}
        </motion.div>

        <h2 className="font-felipa text-3xl mb-2" style={{ color: primaryColor }}>
          จบเกม!
        </h2>

        <p className="font-kanit text-lg mb-6" style={{ color: textMuted }}>
          คะแนน: <span className="font-bold" style={{ color: primaryColor }}>{gameState.score}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className="p-4 rounded-xl border-2"
            style={{ borderColor }}
          >
            <p className="font-felipa text-2xl" style={{ color: primaryColor }}>{gameState.correctAnswers}</p>
            <p className="font-kanit text-xs" style={{ color: textMuted }}>ตอบถูก</p>
          </div>
          <div
            className="p-4 rounded-xl border-2"
            style={{ borderColor }}
          >
            <p className="font-felipa text-2xl" style={{ color: primaryColor }}>{accuracy}%</p>
            <p className="font-kanit text-xs" style={{ color: textMuted }}>ความแม่นยำ</p>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={onExit}
            className="flex-1 py-3 rounded-xl border-2 font-kanit"
            style={{ borderColor, color: textColor }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            กลับ
          </motion.button>
          <motion.button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl border-2 font-kanit flex items-center justify-center gap-2"
            style={{
              backgroundColor: primaryColor,
              borderColor,
              color: "#FFFFFF"
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-4 h-4" />
            เล่นอีก
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Add Flashcard Modal
function AddFlashcardModal({
  isOpen,
  onClose,
  onAdd,
  subjects
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    front: string;
    back: string;
    subjectId?: string;
    subjectName?: string;
  }) => Promise<void>;
  subjects: Array<{ id: string; name: string }>;
}) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [saving, setSaving] = useState(false);

  const backdropBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
  const modalBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const borderColor = primaryColor;
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";

  const handleSubmit = async () => {
    if (!front.trim() || !back.trim()) return;

    setSaving(true);
    try {
      const selectedSubject = subjects.find(s => s.id === subjectId);

      await onAdd({
        front: front.trim(),
        back: back.trim(),
        subjectId: subjectId || undefined,
        subjectName: selectedSubject?.name,
      });

      setFront("");
      setBack("");
      setSubjectId("");
      onClose();
    } catch (error) {
      console.error("Failed to add flashcard:", error);
    } finally {
      setSaving(false);
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
              เพิ่มการ์ดใหม่
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  ด้านหน้า (คำถาม)
                </label>
                <textarea
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="เช่น Photosynthesis คืออะไร?"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none resize-none"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                />
              </div>

              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  ด้านหลัง (คำตอบ)
                </label>
                <textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="เช่น กระบวนการที่พืชใช้แสงแดดสร้างอาหาร"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none resize-none"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                />
              </div>

              <div>
                <label className="font-kanit text-sm mb-1 block" style={{ color: textMuted }}>
                  วิชา (ไม่บังคับ)
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 font-kanit focus:outline-none"
                  style={{ backgroundColor: inputBg, borderColor, color: textColor }}
                >
                  <option value="">ไม่ระบุวิชา</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                onClick={handleSubmit}
                disabled={!front.trim() || !back.trim() || saving}
                className="w-full py-3 rounded-xl border-2 font-kanit font-medium flex items-center justify-center gap-2"
                style={{
                  backgroundColor: primaryColor,
                  borderColor,
                  color: "#FFFFFF",
                  opacity: (!front.trim() || !back.trim() || saving) ? 0.5 : 1
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    เพิ่มการ์ด
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

export default function ReviewPage() {
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
      <MobileUtilities
        isOpen={showMobileUtilities}
        onClose={() => setShowMobileUtilities(false)}
      />

      <MobileHeader
        onUtilitiesClick={() => setShowMobileUtilities(true)}
      />

      <div className="pt-16 xl:pt-0">
        <ReviewDashboard />
      </div>
    </>
  );
}
