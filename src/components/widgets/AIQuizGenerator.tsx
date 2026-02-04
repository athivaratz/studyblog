"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { Subject, Flashcard } from "@/lib/firebaseServices";
import { generateQuizQuestions, researchAndGenerateQuestions, GameQuestion } from "@/lib/geminiService";
import {
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

// Grade levels for Thai students
const gradeLevels = [
  { value: "ป.1", label: "ป.1" },
  { value: "ป.2", label: "ป.2" },
  { value: "ป.3", label: "ป.3" },
  { value: "ป.4", label: "ป.4" },
  { value: "ป.5", label: "ป.5" },
  { value: "ป.6", label: "ป.6" },
  { value: "ม.1", label: "ม.1" },
  { value: "ม.2", label: "ม.2" },
  { value: "ม.3", label: "ม.3" },
  { value: "ม.4", label: "ม.4" },
  { value: "ม.5", label: "ม.5" },
  { value: "ม.6", label: "ม.6" },
];

interface AIQuizGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  flashcards: Flashcard[];
  onGenerate: (questions: Omit<GameQuestion, "id" | "createdAt">[]) => Promise<void>;
}

export function AIQuizGenerator({
  isOpen,
  onClose,
  subjects,
  flashcards,
  onGenerate,
}: AIQuizGeneratorProps) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>("ม.1");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [useFlashcards, setUseFlashcards] = useState(true);
  const [mode, setMode] = useState<"generate" | "research">("generate");
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GameQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"config" | "preview" | "done">("config");
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  // Theme colors
  const bgColor = isDark ? "#1A1A1A" : "#FFFFFF";
  const cardBg = isDark ? "#2D2D2D" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = isDark ? "#404040" : "#E5E5E5";

  const subjectFlashcards = selectedSubject
    ? flashcards.filter((f) => f.subjectId === selectedSubject.id)
    : [];

  const handleGenerate = async () => {
    if (!selectedSubject) {
      setError("กรุณาเลือกวิชา");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      let result;

      if (mode === "research") {
        result = await researchAndGenerateQuestions(
          selectedSubject,
          selectedGrade,
          questionCount
        );
      } else {
        result = await generateQuizQuestions({
          subject: selectedSubject,
          flashcards: useFlashcards ? subjectFlashcards : undefined,
          count: questionCount,
          difficulty,
          gradeLevel: selectedGrade,
        });
      }

      if (result.success) {
        setGeneratedQuestions(result.questions);
        setStep("preview");
      } else {
        setError(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError("ไม่สามารถเชื่อมต่อ AI ได้");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (generatedQuestions.length === 0) return;

    setGenerating(true);
    try {
      await onGenerate(generatedQuestions);
      setStep("done");
    } catch (error) {
      console.error("Save error:", error);
      setError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setSelectedSubject(null);
    setSelectedGrade("ม.1");
    setQuestionCount(10);
    setDifficulty("mixed");
    setUseFlashcards(true);
    setMode("generate");
    setGenerating(false);
    setGeneratedQuestions([]);
    setError(null);
    setStep("config");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg rounded-2xl border-2 p-6 max-h-[85vh] overflow-y-auto"
          style={{ backgroundColor: bgColor, borderColor: primaryColor }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-kanit font-bold text-xl" style={{ color: textColor }}>
                  AI สร้างคำถาม
                </h2>
                <p className="font-kanit text-xs" style={{ color: textMuted }}>
                  ใช้ Gemini AI สร้างโจทย์อัตโนมัติ
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: textMuted }} />
            </button>
          </div>

          {/* Step: Config */}
          {step === "config" && (
            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setMode("generate")}
                  className="flex-1 p-3 rounded-xl flex items-center justify-center gap-2 border-2"
                  style={{
                    backgroundColor: mode === "generate" ? primaryColor : cardBg,
                    borderColor: mode === "generate" ? primaryColor : borderColor,
                    color: mode === "generate" ? "#FFFFFF" : textColor,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-kanit text-sm">จากเนื้อหาที่มี</span>
                </motion.button>
                <motion.button
                  onClick={() => setMode("research")}
                  className="flex-1 p-3 rounded-xl flex items-center justify-center gap-2 border-2"
                  style={{
                    backgroundColor: mode === "research" ? primaryColor : cardBg,
                    borderColor: mode === "research" ? primaryColor : borderColor,
                    color: mode === "research" ? "#FFFFFF" : textColor,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-kanit text-sm">จากหลักสูตร</span>
                </motion.button>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
                  เลือกวิชา
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <motion.button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className="p-3 rounded-xl border-2 text-left transition-all"
                      style={{
                        backgroundColor:
                          selectedSubject?.id === subject.id
                            ? primaryColor
                            : cardBg,
                        borderColor:
                          selectedSubject?.id === subject.id
                            ? primaryColor
                            : borderColor,
                        color:
                          selectedSubject?.id === subject.id
                            ? "#FFFFFF"
                            : textColor,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="font-kanit text-sm">{subject.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Grade Level */}
              <div>
                <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
                  ระดับชั้น
                </label>
                <div className="relative">
                  <motion.button
                    onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                    className="w-full p-3 rounded-xl border-2 flex items-center justify-between"
                    style={{ backgroundColor: cardBg, borderColor }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="font-kanit" style={{ color: textColor }}>
                      {selectedGrade}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showGradeDropdown ? "rotate-180" : ""}`}
                      style={{ color: textMuted }}
                    />
                  </motion.button>
                  {showGradeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl border-2 overflow-hidden z-10 max-h-48 overflow-y-auto"
                      style={{ backgroundColor: bgColor, borderColor }}
                    >
                      {gradeLevels.map((grade) => (
                        <button
                          key={grade.value}
                          onClick={() => {
                            setSelectedGrade(grade.value);
                            setShowGradeDropdown(false);
                          }}
                          className="w-full p-3 text-left font-kanit hover:bg-black/5 transition-colors"
                          style={{
                            color: textColor,
                            backgroundColor:
                              selectedGrade === grade.value
                                ? "rgba(0,86,140,0.1)"
                                : "transparent",
                          }}
                        >
                          {grade.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
                  จำนวนคำถาม: {questionCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-[#00568C]"
                />
              </div>

              {/* Difficulty (only for generate mode) */}
              {mode === "generate" && (
                <div>
                  <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
                    ระดับความยาก
                  </label>
                  <div className="flex gap-2">
                    {(["easy", "medium", "hard", "mixed"] as const).map((d) => (
                      <motion.button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className="flex-1 p-2 rounded-lg text-xs font-kanit border-2"
                        style={{
                          backgroundColor: difficulty === d ? primaryColor : cardBg,
                          borderColor: difficulty === d ? primaryColor : borderColor,
                          color: difficulty === d ? "#FFFFFF" : textColor,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {d === "easy"
                          ? "ง่าย"
                          : d === "medium"
                            ? "กลาง"
                            : d === "hard"
                              ? "ยาก"
                              : "ผสม"}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Use Flashcards */}
              {mode === "generate" && subjectFlashcards.length > 0 && (
                <motion.button
                  onClick={() => setUseFlashcards(!useFlashcards)}
                  className="w-full p-3 rounded-xl flex items-center justify-between border-2"
                  style={{
                    backgroundColor: useFlashcards ? "rgba(0,86,140,0.1)" : cardBg,
                    borderColor: useFlashcards ? primaryColor : borderColor,
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="font-kanit text-sm" style={{ color: textColor }}>
                    ใช้ Flashcard ที่มี ({subjectFlashcards.length} ใบ)
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${useFlashcards ? "bg-[#00568C] border-[#00568C]" : ""}`}
                    style={{ borderColor: useFlashcards ? primaryColor : borderColor }}
                  >
                    {useFlashcards && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </motion.button>
              )}

              {/* Error */}
              {error && (
                <div
                  className="p-3 rounded-xl flex items-start gap-2"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="font-kanit text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={!selectedSubject || generating}
                className="w-full p-4 rounded-xl font-kanit font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI กำลังสร้างคำถาม...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    สร้างคำถาม
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Step: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              {/* Summary */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: cardBg }}
              >
                <p className="font-kanit" style={{ color: textColor }}>
                  AI สร้าง{" "}
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {generatedQuestions.length}
                  </span>{" "}
                  คำถาม
                </p>
              </div>

              {/* Preview List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {generatedQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: cardBg }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="font-kanit text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            q.difficulty === "easy"
                              ? "rgba(34, 197, 94, 0.2)"
                              : q.difficulty === "medium"
                                ? "rgba(234, 179, 8, 0.2)"
                                : "rgba(239, 68, 68, 0.2)",
                          color:
                            q.difficulty === "easy"
                              ? "#22C55E"
                              : q.difficulty === "medium"
                                ? "#EAB308"
                                : "#EF4444",
                        }}
                      >
                        {q.difficulty === "easy"
                          ? "ง่าย"
                          : q.difficulty === "medium"
                            ? "กลาง"
                            : "ยาก"}
                      </span>
                      {q.topic && (
                        <span
                          className="font-kanit text-xs"
                          style={{ color: textMuted }}
                        >
                          {q.topic}
                        </span>
                      )}
                    </div>
                    <p
                      className="font-kanit text-sm font-medium mt-2"
                      style={{ color: textColor }}
                    >
                      {i + 1}. {q.question}
                    </p>
                    <p
                      className="font-kanit text-xs mt-1"
                      style={{ color: textMuted }}
                    >
                      ✓ {q.correctAnswer}
                    </p>
                    {q.explanation && (
                      <p
                        className="font-kanit text-xs mt-1 italic"
                        style={{ color: textMuted }}
                      >
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    setStep("config");
                    setGeneratedQuestions([]);
                  }}
                  className="flex-1 p-3 rounded-xl font-kanit border-2"
                  style={{ borderColor, color: textColor }}
                  whileTap={{ scale: 0.98 }}
                >
                  สร้างใหม่
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={generating}
                  className="flex-1 p-3 rounded-xl font-kanit font-bold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "บันทึกทั้งหมด"
                  )}
                </motion.button>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center py-6 space-y-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-kanit font-bold text-lg" style={{ color: textColor }}>
                  เพิ่มคำถามสำเร็จ!
                </h3>
                <p className="font-kanit text-sm" style={{ color: textMuted }}>
                  เพิ่ม {generatedQuestions.length} คำถามจาก AI เรียบร้อยแล้ว
                </p>
              </div>
              <motion.button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl font-kanit font-bold text-white"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                เสร็จสิ้น
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
