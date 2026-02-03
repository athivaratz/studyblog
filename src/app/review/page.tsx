"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar, MobileHeader, LoadingScreen } from "@/components/layout";
import { FolderCard } from "@/components/ui";
import { ClockTimerWidget, IPodPlayer, MobileUtilities, CSVImportModal, AIQuizGenerator } from "@/components/widgets";
import { TutorialOverlay } from "@/components/tutorial";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoginCard } from "@/components/auth";
import { useFlashcards, useSubjects, useInitializeUser, useReviewSessions, useQuizQuestions } from "@/hooks/useFirebaseData";
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
  BookOpen
} from "lucide-react";

// Primary color
const primaryColor = "#00568C";

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
  }>;
}

// Stats Card Component
function StatsCard({ value, label }: { value: number | string; label: string }) {
  const { theme } = useTheme();
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

// Main Review Dashboard
function ReviewDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { subjects } = useSubjects();
  const { flashcards, dueForReview, loading, addFlashcard, removeFlashcard, reviewFlashcard } = useFlashcards();
  const { stats, addSession } = useReviewSessions();
  const { questions: quizQuestions, addQuestions } = useQuizQuestions();

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
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

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

  // Start a game
  const startGame = (mode: "quiz" | "memory" | "speed") => {
    const cardsToUse = dueCards.length > 0 ? dueCards : filteredFlashcards;
    if (cardsToUse.length < 4) {
      alert("ต้องมีการ์ดอย่างน้อย 4 ใบเพื่อเริ่มเกม");
      return;
    }

    // Shuffle cards
    const shuffled = [...cardsToUse].sort(() => Math.random() - 0.5);
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
        front: c.question,
        back: c.answer,
        subjectId: c.subjectId,
      })),
    });
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
        subjectId: selectedSubjectFilter !== "all" ? selectedSubjectFilter : undefined,
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

    // Update flashcard with SM-2 algorithm (quality: 0-5, 3=correct, 0=incorrect)
    await reviewFlashcard(currentCard.id, correct ? 4 : 1);

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

            {/* Game Modes */}
            <FolderCard title="เลือกโหมดเกม">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {gameModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    onClick={() => startGame(mode.id)}
                    disabled={filteredFlashcards.length < 4}
                    className="p-4 rounded-2xl border-2 text-left relative overflow-hidden"
                    style={{
                      backgroundColor: mode.color,
                      borderColor,
                      opacity: filteredFlashcards.length < 4 ? 0.5 : 1,
                    }}
                    whileHover={{ scale: filteredFlashcards.length >= 4 ? 1.02 : 1 }}
                    whileTap={{ scale: filteredFlashcards.length >= 4 ? 0.98 : 1 }}
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
                  </motion.button>
                ))}
              </div>
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
        onImport={async (questions) => {
          await addQuestions(questions.map(q => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            wrongAnswers: q.wrongAnswers,
            difficulty: q.difficulty,
            subjectId: q.subjectId,
            subjectName: q.subjectName,
            topic: q.topic,
            source: q.source,
          })));
        }}
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
      const otherCards = gameState.cards.filter(c => c.id !== currentCard.id);
      const wrongAnswers = otherCards
        .slice(0, 3)
        .map(c => c.back);

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
        <ReviewDashboard />
      </div>
    </>
  );
}
