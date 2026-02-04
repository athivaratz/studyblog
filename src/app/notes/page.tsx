"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout";
import { FolderCard, ConfirmDialog } from "@/components/ui";
import { IPodPlayer, ClockTimerWidget } from "@/components/widgets";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginCard } from "@/components/auth";
import { useSubjects, useNotes } from "@/hooks/useFirebaseData";
import {
  Loader2,
  Plus,
  FileText,
  ChevronDown,
  Trash2,
  Edit3,
  X,
  Save,
  BookOpen,
} from "lucide-react";

const primaryColor = "#00568C";

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const { subjects } = useSubjects();
  const { notes, loading, addNote, editNote, removeNote } = useNotes();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; noteId: string | null }>({
    show: false,
    noteId: null,
  });

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");

  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";
  const dropdownBg = isDark ? "#3D3D3D" : "#FFFFFF";
  const hoverBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
  const inputBg = isDark ? "#3D3D3D" : "#F5F5F5";

  // Filter notes by subject
  const filteredNotes =
    selectedSubject === "all" ? notes : notes.filter((n) => n.subjectId === selectedSubject);

  const handleAddNote = async () => {
    if (!newTitle.trim() || !newSubjectId) return;
    await addNote({
      title: newTitle,
      content: newContent,
      subjectId: newSubjectId,
    });
    setShowAddModal(false);
    setNewTitle("");
    setNewContent("");
    setNewSubjectId("");
  };

  const handleSaveEdit = async (noteId: string, title: string, content: string) => {
    await editNote(noteId, { title, content });
    setEditingNote(null);
  };

  const handleDeleteNote = async () => {
    if (confirmDelete.noteId) {
      await removeNote(confirmDelete.noteId);
      setConfirmDelete({ show: false, noteId: null });
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "วันนี้";
    if (days === 1) return "เมื่อวาน";
    return `${days} วันที่แล้ว`;
  };

  const subjectColors: Record<string, string> = {
    yellow: isDark ? "#4D4A2A" : "#FFF3B0",
    pink: isDark ? "#5C3A42" : "#FFD6E0",
    blue: isDark ? "#2A3A4D" : "#C5E8FF",
    green: isDark ? "#2A4D2A" : "#D4F5D4",
    purple: isDark ? "#3D2A4D" : "#E8D5F2",
    orange: isDark ? "#4D3A2A" : "#FFE4C9",
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
            <FolderCard title={t("notes.title")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: primaryColor }} />
                  <p className="font-kanit text-sm" style={{ color: textMuted }}>
                    จดโน้ตและบันทึกสำคัญ
                  </p>
                </div>

                {/* Subject Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2"
                    style={{ borderColor: primaryColor, color: textColor }}
                  >
                    <span className="font-kanit text-sm">
                      {selectedSubject === "all"
                        ? "ทุกวิชา"
                        : subjects.find((s) => s.id === selectedSubject)?.name || "เลือกวิชา"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showSubjectDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-xl border-2 overflow-hidden z-10"
                        style={{ backgroundColor: dropdownBg, borderColor: primaryColor }}
                      >
                        <button
                          onClick={() => {
                            setSelectedSubject("all");
                            setShowSubjectDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left font-kanit text-sm"
                          style={{
                            backgroundColor: selectedSubject === "all" ? hoverBg : "transparent",
                            color: textColor,
                          }}
                        >
                          ทุกวิชา
                        </button>
                        {subjects.map((subject) => (
                          <button
                            key={subject.id}
                            onClick={() => {
                              setSelectedSubject(subject.id);
                              setShowSubjectDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left font-kanit text-sm flex items-center gap-2"
                            style={{
                              backgroundColor:
                                selectedSubject === subject.id ? hoverBg : "transparent",
                              color: textColor,
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: subjectColors[subject.color] }}
                            />
                            {subject.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </FolderCard>

            {/* Notes List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.map((note) => {
                  const subject = subjects.find((s) => s.id === note.subjectId);
                  const isEditing = editingNote === note.id;

                  return (
                    <motion.div
                      key={note.id}
                      layoutId={note.id}
                      className="rounded-2xl border-2 p-4"
                      style={{
                        backgroundColor: subject
                          ? subjectColors[subject.color]
                          : cardBg,
                        borderColor: primaryColor,
                      }}
                    >
                      {isEditing ? (
                        <NoteEditor
                          initialTitle={note.title}
                          initialContent={note.content}
                          onSave={(title, content) => handleSaveEdit(note.id, title, content)}
                          onCancel={() => setEditingNote(null)}
                          isDark={isDark}
                        />
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <h3
                              className="font-kanit font-medium text-base"
                              style={{ color: textColor }}
                            >
                              {note.title}
                            </h3>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingNote(note.id)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: textMuted }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmDelete({ show: true, noteId: note.id })
                                }
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: "#EF4444" }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p
                            className="font-kanit text-sm whitespace-pre-wrap line-clamp-4"
                            style={{ color: textMuted }}
                          >
                            {note.content || "ไม่มีเนื้อหา"}
                          </p>

                          <div className="flex items-center justify-between mt-4 pt-2 border-t border-black/10">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" style={{ color: textMuted }} />
                              <span
                                className="font-kanit text-xs"
                                style={{ color: textMuted }}
                              >
                                {subject?.name || "ไม่ระบุวิชา"}
                              </span>
                            </div>
                            <span className="font-kanit text-xs" style={{ color: textMuted }}>
                              {formatDate(note.updatedAt)}
                            </span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: textMuted }}
                />
                <p className="font-kanit" style={{ color: textMuted }}>
                  {t("notes.no_notes")}
                </p>
              </div>
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

      {/* Add Note Modal */}
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
              className="w-full max-w-md rounded-2xl border-2 p-6"
              style={{
                backgroundColor: cardBg,
                borderColor: primaryColor,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-felipa text-xl" style={{ color: textColor }}>
                  {t("notes.add_note")}
                </h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" style={{ color: textMuted }} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Subject Select */}
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    วิชา
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: primaryColor,
                      color: textColor,
                    }}
                  >
                    <option value="">เลือกวิชา</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    หัวข้อ
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="หัวข้อโน้ต"
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: primaryColor,
                      color: textColor,
                    }}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="font-kanit text-sm" style={{ color: textMuted }}>
                    เนื้อหา
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="เนื้อหาโน้ต..."
                    rows={6}
                    className="w-full mt-1 px-3 py-2 rounded-lg border-2 outline-none font-kanit resize-none"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: primaryColor,
                      color: textColor,
                    }}
                  />
                </div>
              </div>

              <motion.button
                onClick={handleAddNote}
                disabled={!newTitle.trim() || !newSubjectId}
                className="w-full mt-6 py-2 rounded-xl font-kanit text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                บันทึก
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        onCancel={() => setConfirmDelete({ show: false, noteId: null })}
        onConfirm={handleDeleteNote}
        title="ลบโน้ต"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        variant="danger"
      />
    </div>
  );
}

// Note Editor Component
function NoteEditor({
  initialTitle,
  initialContent,
  onSave,
  onCancel,
  isDark,
}: {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  isDark: boolean;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const inputBg = isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)";

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border-2 outline-none font-kanit font-medium"
        style={{
          backgroundColor: inputBg,
          borderColor: primaryColor,
          color: textColor,
        }}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 rounded-lg border-2 outline-none font-kanit resize-none"
        style={{
          backgroundColor: inputBg,
          borderColor: primaryColor,
          color: textColor,
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(title, content)}
          className="flex-1 py-2 rounded-lg font-kanit text-sm text-white flex items-center justify-center gap-1"
          style={{ backgroundColor: primaryColor }}
        >
          <Save className="w-4 h-4" />
          บันทึก
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg font-kanit text-sm border-2"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
