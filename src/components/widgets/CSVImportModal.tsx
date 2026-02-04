"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { Subject } from "@/lib/firebaseServices";
import { parseCSVQuestions, downloadCSVTemplate, GameQuestion } from "@/lib/geminiService";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onImport: (questions: Omit<GameQuestion, "id" | "createdAt">[]) => Promise<void>;
}

export function CSVImportModal({
  isOpen,
  onClose,
  subjects,
  onImport,
}: CSVImportModalProps) {
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const isDark = theme === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [parsedQuestions, setParsedQuestions] = useState<GameQuestion[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"select" | "preview" | "done">("select");

  // Theme colors
  const bgColor = isDark ? "#1A1A1A" : "#FFFFFF";
  const cardBg = isDark ? "#2D2D2D" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = isDark ? "#404040" : "#E5E5E5";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setParseErrors(["กรุณาเลือกไฟล์ .csv เท่านั้น"]);
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleParse = () => {
    if (!selectedSubject) {
      setParseErrors(["กรุณาเลือกวิชาก่อน"]);
      return;
    }

    if (!csvContent) {
      setParseErrors(["กรุณาเลือกไฟล์ CSV"]);
      return;
    }

    const { questions, errors } = parseCSVQuestions(
      csvContent,
      selectedSubject.id,
      selectedSubject.name
    );

    setParsedQuestions(questions);
    setParseErrors(errors);

    if (questions.length > 0) {
      setStep("preview");
    }
  };

  const handleImport = async () => {
    if (parsedQuestions.length === 0) return;

    setImporting(true);
    try {
      await onImport(parsedQuestions);
      setStep("done");
    } catch (error) {
      console.error("Import error:", error);
      setParseErrors(["เกิดข้อผิดพลาดในการ import"]);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedSubject(null);
    setCsvContent("");
    setFileName("");
    setParsedQuestions([]);
    setParseErrors([]);
    setStep("select");
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
          className="w-full max-w-lg rounded-2xl border-2 p-6 max-h-[80vh] overflow-y-auto"
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
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-kanit font-bold text-xl" style={{ color: textColor }}>
                Import คำถามจาก CSV
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: textMuted }} />
            </button>
          </div>

          {/* Step: Select */}
          {step === "select" && (
            <div className="space-y-4">
              {/* Subject Selection - Dropdown */}
              <div>
                <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
                  เลือกวิชา
                </label>
                <select
                  value={selectedSubject?.id || ""}
                  onChange={(e) => {
                    const subject = subjects.find(s => s.id === e.target.value);
                    setSelectedSubject(subject || null);
                  }}
                  className="w-full p-3 rounded-xl border-2 font-kanit text-sm appearance-none cursor-pointer"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: selectedSubject ? primaryColor : borderColor,
                    color: textColor,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? '%23FFFFFF' : '%231A1A1A'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "20px",
                    paddingRight: "40px",
                  }}
                >
                  <option value="" disabled>-- เลือกวิชา --</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="font-kanit text-sm mb-2 block" style={{ color: textMuted }}>
                  เลือกไฟล์ CSV
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors"
                  style={{ borderColor: fileName ? primaryColor : borderColor }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Upload className="w-8 h-8" style={{ color: primaryColor }} />
                  <span className="font-kanit text-sm" style={{ color: textColor }}>
                    {fileName || "คลิกเพื่อเลือกไฟล์"}
                  </span>
                </motion.button>
              </div>

              {/* Download Template */}
              <motion.button
                onClick={downloadCSVTemplate}
                className="w-full p-3 rounded-xl flex items-center justify-center gap-2"
                style={{ backgroundColor: cardBg }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Download className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="font-kanit text-sm" style={{ color: primaryColor }}>
                  ดาวน์โหลดตัวอย่าง CSV
                </span>
              </motion.button>

              {/* Errors */}
              {parseErrors.length > 0 && (
                <div
                  className="p-3 rounded-xl flex items-start gap-2"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    {parseErrors.map((err, i) => (
                      <p key={i} className="font-kanit text-sm text-red-500">
                        {err}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Parse Button */}
              <motion.button
                onClick={handleParse}
                disabled={!selectedSubject || !csvContent}
                className="w-full p-3 rounded-xl font-kanit font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ตรวจสอบไฟล์
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
                  พบ{" "}
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {parsedQuestions.length}
                  </span>{" "}
                  คำถาม
                </p>
                {parseErrors.length > 0 && (
                  <p className="font-kanit text-sm text-orange-500 mt-1">
                    ⚠️ มี {parseErrors.length} บรรทัดที่มีปัญหา
                  </p>
                )}
              </div>

              {/* Preview List */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {parsedQuestions.slice(0, 5).map((q, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: cardBg }}
                  >
                    <p
                      className="font-kanit text-sm font-medium truncate"
                      style={{ color: textColor }}
                    >
                      {i + 1}. {q.question}
                    </p>
                    <p
                      className="font-kanit text-xs mt-1"
                      style={{ color: textMuted }}
                    >
                      คำตอบ: {q.correctAnswer}
                    </p>
                  </div>
                ))}
                {parsedQuestions.length > 5 && (
                  <p
                    className="font-kanit text-sm text-center"
                    style={{ color: textMuted }}
                  >
                    ...และอีก {parsedQuestions.length - 5} คำถาม
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep("select")}
                  className="flex-1 p-3 rounded-xl font-kanit border-2"
                  style={{ borderColor, color: textColor }}
                  whileTap={{ scale: 0.98 }}
                >
                  ย้อนกลับ
                </motion.button>
                <motion.button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 p-3 rounded-xl font-kanit font-bold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลัง Import...
                    </>
                  ) : (
                    "Import ทั้งหมด"
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
                  Import สำเร็จ!
                </h3>
                <p className="font-kanit text-sm" style={{ color: textMuted }}>
                  เพิ่ม {parsedQuestions.length} คำถามเรียบร้อยแล้ว
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
