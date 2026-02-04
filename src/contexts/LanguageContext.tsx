"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";

type Language = "th" | "en";

// Translation keys
type TranslationKey =
  // Common
  | "common.save"
  | "common.cancel"
  | "common.delete"
  | "common.edit"
  | "common.add"
  | "common.close"
  | "common.confirm"
  | "common.loading"
  | "common.error"
  | "common.success"
  | "common.search"
  | "common.filter"
  | "common.all"
  | "common.none"
  | "common.today"
  | "common.tomorrow"
  | "common.yesterday"
  | "common.days"
  | "common.hours"
  | "common.minutes"
  | "common.seconds"
  // Navigation
  | "nav.home"
  | "nav.todo"
  | "nav.schedule"
  | "nav.review"
  | "nav.settings"
  | "nav.subjects"
  | "nav.homework"
  | "nav.notes"
  | "nav.stats"
  | "nav.goals"
  // Search
  | "search.placeholder"
  | "search.placeholder_full"
  | "search.no_results"
  | "search.hint"
  | "search.navigate"
  | "search.select"
  | "search.close"
  | "search.subject"
  | "search.homework"
  | "search.note"
  | "search.flashcard"
  | "search.goal"
  // Sync
  | "sync.synced"
  | "sync.syncing"
  | "sync.offline"
  | "sync.error"
  | "sync.all_data_synced"
  | "sync.syncing_data"
  | "sync.offline_mode"
  | "sync.sync_failed"
  // Dashboard
  | "dashboard.welcome"
  | "dashboard.pending_homework"
  | "dashboard.urgent"
  | "dashboard.overdue"
  | "dashboard.completed"
  | "dashboard.study_streak"
  | "dashboard.total_study_time"
  // Todo
  | "todo.title"
  | "todo.add_new"
  | "todo.category.all"
  | "todo.category.homework"
  | "todo.category.personal"
  | "todo.category.other"
  | "todo.due_date"
  | "todo.no_todos"
  // Homework
  | "homework.title"
  | "homework.add_new"
  | "homework.pending"
  | "homework.completed"
  | "homework.urgent"
  | "homework.overdue"
  | "homework.due_in"
  | "homework.no_homework"
  // Schedule
  | "schedule.title"
  | "schedule.add_class"
  | "schedule.no_classes"
  | "schedule.room"
  | "schedule.teacher"
  // Review
  | "review.title"
  | "review.flashcards"
  | "review.quiz"
  | "review.due_for_review"
  | "review.start_quiz"
  | "review.add_card"
  | "review.no_cards"
  // Settings
  | "settings.title"
  | "settings.profile"
  | "settings.theme"
  | "settings.language"
  | "settings.notifications"
  | "settings.logout"
  | "settings.theme_light"
  | "settings.theme_dark"
  | "settings.theme_auto"
  // Goals
  | "goals.title"
  | "goals.add_goal"
  | "goals.in_progress"
  | "goals.completed"
  | "goals.target"
  | "goals.current"
  | "goals.deadline"
  | "goals.no_goals"
  // Notes
  | "notes.title"
  | "notes.add_note"
  | "notes.no_notes"
  | "notes.last_updated"
  // Stats
  | "stats.title"
  | "stats.study_time"
  | "stats.homework_completed"
  | "stats.quizzes_taken"
  | "stats.current_streak"
  | "stats.best_streak"
  | "stats.this_week"
  | "stats.this_month"
  // Pomodoro
  | "pomodoro.title"
  | "pomodoro.work"
  | "pomodoro.break"
  | "pomodoro.long_break"
  | "pomodoro.sessions"
  | "pomodoro.start"
  | "pomodoro.pause"
  | "pomodoro.reset"
  | "pomodoro.skip"
  // Share
  | "share.title"
  | "share.copy_code"
  | "share.code_copied"
  | "share.expires_in"
  | "share.enter_code"
  | "share.import"
  // Days
  | "days.sunday"
  | "days.monday"
  | "days.tuesday"
  | "days.wednesday"
  | "days.thursday"
  | "days.friday"
  | "days.saturday"
  | "days.sun"
  | "days.mon"
  | "days.tue"
  | "days.wed"
  | "days.thu"
  | "days.fri"
  | "days.sat";

const translations: Record<Language, Record<TranslationKey, string>> = {
  th: {
    // Common
    "common.save": "บันทึก",
    "common.cancel": "ยกเลิก",
    "common.delete": "ลบ",
    "common.edit": "แก้ไข",
    "common.add": "เพิ่ม",
    "common.close": "ปิด",
    "common.confirm": "ยืนยัน",
    "common.loading": "กำลังโหลด...",
    "common.error": "เกิดข้อผิดพลาด",
    "common.success": "สำเร็จ",
    "common.search": "ค้นหา",
    "common.filter": "กรอง",
    "common.all": "ทั้งหมด",
    "common.none": "ไม่มี",
    "common.today": "วันนี้",
    "common.tomorrow": "พรุ่งนี้",
    "common.yesterday": "เมื่อวาน",
    "common.days": "วัน",
    "common.hours": "ชั่วโมง",
    "common.minutes": "นาที",
    "common.seconds": "วินาที",
    // Navigation
    "nav.home": "หน้าแรก",
    "nav.todo": "สิ่งที่ต้องทำ",
    "nav.schedule": "ตารางเรียน",
    "nav.review": "ทบทวน",
    "nav.settings": "ตั้งค่า",
    "nav.subjects": "วิชาเรียน",
    "nav.homework": "การบ้าน",
    "nav.notes": "โน้ต",
    "nav.stats": "สถิติ",
    "nav.goals": "เป้าหมาย",
    // Search
    "search.placeholder": "ค้นหา...",
    "search.placeholder_full": "ค้นหาวิชา, การบ้าน, โน้ต...",
    "search.no_results": "ไม่พบผลลัพธ์",
    "search.hint": "พิมพ์เพื่อค้นหา",
    "search.navigate": "เลื่อน",
    "search.select": "เลือก",
    "search.close": "ปิด",
    "search.subject": "วิชา",
    "search.homework": "การบ้าน",
    "search.note": "โน้ต",
    "search.flashcard": "แฟลชการ์ด",
    "search.goal": "เป้าหมาย",
    // Sync
    "sync.synced": "ซิงค์แล้ว",
    "sync.syncing": "กำลังซิงค์",
    "sync.offline": "ออฟไลน์",
    "sync.error": "ซิงค์ผิดพลาด",
    "sync.all_data_synced": "ข้อมูลทั้งหมดซิงค์แล้ว",
    "sync.syncing_data": "กำลังซิงค์ข้อมูล...",
    "sync.offline_mode": "โหมดออฟไลน์ - การเปลี่ยนแปลงจะซิงค์เมื่อออนไลน์",
    "sync.sync_failed": "ซิงค์ไม่สำเร็จ กรุณาลองใหม่",
    // Dashboard
    "dashboard.welcome": "สวัสดี",
    "dashboard.pending_homework": "การบ้านค้าง",
    "dashboard.urgent": "เร่งด่วน",
    "dashboard.overdue": "เลยกำหนด",
    "dashboard.completed": "เสร็จแล้ว",
    "dashboard.study_streak": "Streak การเรียน",
    "dashboard.total_study_time": "เวลาเรียนรวม",
    // Todo
    "todo.title": "สิ่งที่ต้องทำ",
    "todo.add_new": "เพิ่มรายการใหม่",
    "todo.category.all": "ทั้งหมด",
    "todo.category.homework": "การบ้าน",
    "todo.category.personal": "ส่วนตัว",
    "todo.category.other": "อื่นๆ",
    "todo.due_date": "กำหนดส่ง",
    "todo.no_todos": "ไม่มีรายการที่ต้องทำ",
    // Homework
    "homework.title": "การบ้าน",
    "homework.add_new": "เพิ่มการบ้าน",
    "homework.pending": "รอดำเนินการ",
    "homework.completed": "เสร็จแล้ว",
    "homework.urgent": "เร่งด่วน",
    "homework.overdue": "เลยกำหนด",
    "homework.due_in": "กำหนดส่งใน",
    "homework.no_homework": "ไม่มีการบ้าน",
    // Schedule
    "schedule.title": "ตารางเรียน",
    "schedule.add_class": "เพิ่มคาบเรียน",
    "schedule.no_classes": "ไม่มีคาบเรียนวันนี้",
    "schedule.room": "ห้อง",
    "schedule.teacher": "ครูผู้สอน",
    // Review
    "review.title": "ทบทวน",
    "review.flashcards": "แฟลชการ์ด",
    "review.quiz": "ทำแบบทดสอบ",
    "review.due_for_review": "ถึงเวลาทบทวน",
    "review.start_quiz": "เริ่มทำ Quiz",
    "review.add_card": "เพิ่มการ์ด",
    "review.no_cards": "ยังไม่มีการ์ด",
    // Settings
    "settings.title": "ตั้งค่า",
    "settings.profile": "โปรไฟล์",
    "settings.theme": "ธีม",
    "settings.language": "ภาษา",
    "settings.notifications": "การแจ้งเตือน",
    "settings.logout": "ออกจากระบบ",
    "settings.theme_light": "สว่าง",
    "settings.theme_dark": "มืด",
    "settings.theme_auto": "อัตโนมัติ",
    // Goals
    "goals.title": "เป้าหมาย",
    "goals.add_goal": "เพิ่มเป้าหมาย",
    "goals.in_progress": "กำลังดำเนินการ",
    "goals.completed": "สำเร็จแล้ว",
    "goals.target": "เป้าหมาย",
    "goals.current": "ปัจจุบัน",
    "goals.deadline": "กำหนด",
    "goals.no_goals": "ยังไม่มีเป้าหมาย",
    // Notes
    "notes.title": "โน้ต",
    "notes.add_note": "เพิ่มโน้ต",
    "notes.no_notes": "ยังไม่มีโน้ต",
    "notes.last_updated": "แก้ไขล่าสุด",
    // Stats
    "stats.title": "สถิติการเรียน",
    "stats.study_time": "เวลาเรียน",
    "stats.homework_completed": "การบ้านที่เสร็จ",
    "stats.quizzes_taken": "แบบทดสอบที่ทำ",
    "stats.current_streak": "Streak ปัจจุบัน",
    "stats.best_streak": "Streak สูงสุด",
    "stats.this_week": "สัปดาห์นี้",
    "stats.this_month": "เดือนนี้",
    // Pomodoro
    "pomodoro.title": "Pomodoro Timer",
    "pomodoro.work": "ทำงาน",
    "pomodoro.break": "พัก",
    "pomodoro.long_break": "พักยาว",
    "pomodoro.sessions": "รอบ",
    "pomodoro.start": "เริ่ม",
    "pomodoro.pause": "หยุด",
    "pomodoro.reset": "รีเซ็ต",
    "pomodoro.skip": "ข้าม",
    // Share
    "share.title": "แชร์ Quiz",
    "share.copy_code": "คัดลอกโค้ด",
    "share.code_copied": "คัดลอกแล้ว!",
    "share.expires_in": "หมดอายุใน",
    "share.enter_code": "ใส่โค้ด",
    "share.import": "นำเข้า",
    // Days
    "days.sunday": "อาทิตย์",
    "days.monday": "จันทร์",
    "days.tuesday": "อังคาร",
    "days.wednesday": "พุธ",
    "days.thursday": "พฤหัสบดี",
    "days.friday": "ศุกร์",
    "days.saturday": "เสาร์",
    "days.sun": "อา",
    "days.mon": "จ",
    "days.tue": "อ",
    "days.wed": "พ",
    "days.thu": "พฤ",
    "days.fri": "ศ",
    "days.sat": "ส",
  },
  en: {
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",
    "common.none": "None",
    "common.today": "Today",
    "common.tomorrow": "Tomorrow",
    "common.yesterday": "Yesterday",
    "common.days": "days",
    "common.hours": "hours",
    "common.minutes": "minutes",
    "common.seconds": "seconds",
    // Navigation
    "nav.home": "Home",
    "nav.todo": "To-Do",
    "nav.schedule": "Schedule",
    "nav.review": "Review",
    "nav.settings": "Settings",
    "nav.subjects": "Subjects",
    "nav.homework": "Homework",
    "nav.notes": "Notes",
    "nav.stats": "Statistics",
    "nav.goals": "Goals",
    // Search
    "search.placeholder": "Search...",
    "search.placeholder_full": "Search subjects, homework, notes...",
    "search.no_results": "No results found",
    "search.hint": "Type to search",
    "search.navigate": "Navigate",
    "search.select": "Select",
    "search.close": "Close",
    "search.subject": "Subject",
    "search.homework": "Homework",
    "search.note": "Note",
    "search.flashcard": "Flashcard",
    "search.goal": "Goal",
    // Sync
    "sync.synced": "Synced",
    "sync.syncing": "Syncing",
    "sync.offline": "Offline",
    "sync.error": "Sync Error",
    "sync.all_data_synced": "All data synced",
    "sync.syncing_data": "Syncing data...",
    "sync.offline_mode": "Offline mode - changes will sync when online",
    "sync.sync_failed": "Sync failed. Please try again",
    // Dashboard
    "dashboard.welcome": "Hello",
    "dashboard.pending_homework": "Pending",
    "dashboard.urgent": "Urgent",
    "dashboard.overdue": "Overdue",
    "dashboard.completed": "Completed",
    "dashboard.study_streak": "Study Streak",
    "dashboard.total_study_time": "Total Study Time",
    // Todo
    "todo.title": "To-Do",
    "todo.add_new": "Add new item",
    "todo.category.all": "All",
    "todo.category.homework": "Homework",
    "todo.category.personal": "Personal",
    "todo.category.other": "Other",
    "todo.due_date": "Due date",
    "todo.no_todos": "No items to do",
    // Homework
    "homework.title": "Homework",
    "homework.add_new": "Add homework",
    "homework.pending": "Pending",
    "homework.completed": "Completed",
    "homework.urgent": "Urgent",
    "homework.overdue": "Overdue",
    "homework.due_in": "Due in",
    "homework.no_homework": "No homework",
    // Schedule
    "schedule.title": "Schedule",
    "schedule.add_class": "Add class",
    "schedule.no_classes": "No classes today",
    "schedule.room": "Room",
    "schedule.teacher": "Teacher",
    // Review
    "review.title": "Review",
    "review.flashcards": "Flashcards",
    "review.quiz": "Quiz",
    "review.due_for_review": "Due for review",
    "review.start_quiz": "Start Quiz",
    "review.add_card": "Add card",
    "review.no_cards": "No cards yet",
    // Settings
    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.notifications": "Notifications",
    "settings.logout": "Log out",
    "settings.theme_light": "Light",
    "settings.theme_dark": "Dark",
    "settings.theme_auto": "Auto",
    // Goals
    "goals.title": "Goals",
    "goals.add_goal": "Add goal",
    "goals.in_progress": "In Progress",
    "goals.completed": "Completed",
    "goals.target": "Target",
    "goals.current": "Current",
    "goals.deadline": "Deadline",
    "goals.no_goals": "No goals yet",
    // Notes
    "notes.title": "Notes",
    "notes.add_note": "Add note",
    "notes.no_notes": "No notes yet",
    "notes.last_updated": "Last updated",
    // Stats
    "stats.title": "Study Statistics",
    "stats.study_time": "Study Time",
    "stats.homework_completed": "Homework Completed",
    "stats.quizzes_taken": "Quizzes Taken",
    "stats.current_streak": "Current Streak",
    "stats.best_streak": "Best Streak",
    "stats.this_week": "This Week",
    "stats.this_month": "This Month",
    // Pomodoro
    "pomodoro.title": "Pomodoro Timer",
    "pomodoro.work": "Work",
    "pomodoro.break": "Break",
    "pomodoro.long_break": "Long Break",
    "pomodoro.sessions": "Sessions",
    "pomodoro.start": "Start",
    "pomodoro.pause": "Pause",
    "pomodoro.reset": "Reset",
    "pomodoro.skip": "Skip",
    // Share
    "share.title": "Share Quiz",
    "share.copy_code": "Copy Code",
    "share.code_copied": "Copied!",
    "share.expires_in": "Expires in",
    "share.enter_code": "Enter code",
    "share.import": "Import",
    // Days
    "days.sunday": "Sunday",
    "days.monday": "Monday",
    "days.tuesday": "Tuesday",
    "days.wednesday": "Wednesday",
    "days.thursday": "Thursday",
    "days.friday": "Friday",
    "days.saturday": "Saturday",
    "days.sun": "Sun",
    "days.mon": "Mon",
    "days.tue": "Tue",
    "days.wed": "Wed",
    "days.thu": "Thu",
    "days.fri": "Fri",
    "days.sat": "Sat",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");
  const { user } = useAuth();

  // Load language from localStorage or user settings
  useEffect(() => {
    const savedLang = localStorage.getItem("studyblog_language") as Language;
    if (savedLang && (savedLang === "th" || savedLang === "en")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("studyblog_language", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
