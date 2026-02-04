"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout";
import { FolderCard } from "@/components/ui";
import { IPodPlayer, ClockTimerWidget } from "@/components/widgets";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, usePrimaryColor } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoginCard } from "@/components/auth";
import {
  Loader2,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Brain,
  Flame,
  Calendar,
  BookOpen,
} from "lucide-react";
import {
  getDailyStats,
  calculateStudyStreak,
  getStudySessions,
  DailyStats,
  StudySession,
} from "@/lib/firebaseServices";
import { useHomework, useFlashcards, useReviewSessions } from "@/hooks/useFirebaseData";

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const primaryColor = usePrimaryColor();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("week");

  const { homework, completedHomework } = useHomework();
  const { flashcards } = useFlashcards();
  const { stats: reviewStats } = useReviewSessions();

  const pageBg = isDark ? "#1A1A1A" : "#F5F5F5";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMuted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const cardBg = isDark ? "#2D2D2D" : "#FFFFFF";

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const days = selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365;
        const [stats, sessions, currentStreak] = await Promise.all([
          getDailyStats(user.uid, days),
          getStudySessions(user.uid),
          calculateStudyStreak(user.uid),
        ]);
        setDailyStats(stats);
        setStudySessions(sessions);
        setStreak(currentStreak);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, selectedPeriod]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalStudyMinutes = dailyStats.reduce((sum, s) => sum + s.studyMinutes, 0);
    const totalHomeworkCompleted = dailyStats.reduce((sum, s) => sum + s.homeworkCompleted, 0);
    const totalQuizzes = dailyStats.reduce((sum, s) => sum + s.quizzesTaken, 0);
    const totalFlashcards = dailyStats.reduce((sum, s) => sum + s.flashcardsReviewed, 0);

    return {
      studyHours: Math.floor(totalStudyMinutes / 60),
      studyMinutes: totalStudyMinutes % 60,
      homeworkCompleted: totalHomeworkCompleted,
      quizzes: totalQuizzes,
      flashcards: totalFlashcards,
    };
  }, [dailyStats]);

  // Generate chart data (last 7 days)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const stat = dailyStats.find((s) => s.date === dateStr);
      days.push({
        date: dateStr,
        label: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"][date.getDay()],
        studyMinutes: stat?.studyMinutes || 0,
        homeworkCompleted: stat?.homeworkCompleted || 0,
      });
    }
    return days;
  }, [dailyStats]);

  const maxStudyMinutes = Math.max(...chartData.map((d) => d.studyMinutes), 60);

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
            <FolderCard title={t("stats.title")}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" style={{ color: primaryColor }} />
                <p className="font-kanit text-sm" style={{ color: textMuted }}>
                  ดูสถิติและความก้าวหน้าในการเรียนของคุณ
                </p>
              </div>

              {/* Period Filter */}
              <div className="flex gap-2">
                {(["week", "month", "all"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className="px-3 py-1 rounded-lg font-kanit text-sm transition-all"
                    style={{
                      backgroundColor:
                        selectedPeriod === period ? primaryColor : "transparent",
                      color: selectedPeriod === period ? "#FFFFFF" : textMuted,
                      border: `1px solid ${primaryColor}`,
                    }}
                  >
                    {period === "week" ? "7 วัน" : period === "month" ? "30 วัน" : "ทั้งหมด"}
                  </button>
                ))}
              </div>
            </FolderCard>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Study Time */}
                  <motion.div
                    className="rounded-2xl border-2 p-4"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: primaryColor,
                      boxShadow: `4px 4px 0px ${primaryColor}`,
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: "#C5E8FF" }}
                    >
                      <Clock className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <p className="font-felipa text-2xl" style={{ color: primaryColor }}>
                      {totals.studyHours}h {totals.studyMinutes}m
                    </p>
                    <p className="font-kanit text-xs" style={{ color: textMuted }}>
                      {t("stats.study_time")}
                    </p>
                  </motion.div>

                  {/* Streak */}
                  <motion.div
                    className="rounded-2xl border-2 p-4"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: "#FF6B6B",
                      boxShadow: `4px 4px 0px #FF6B6B`,
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: "#FFD6E0" }}
                    >
                      <Flame className="w-5 h-5" style={{ color: "#FF6B6B" }} />
                    </div>
                    <p className="font-felipa text-2xl" style={{ color: "#FF6B6B" }}>
                      {streak} {t("common.days")}
                    </p>
                    <p className="font-kanit text-xs" style={{ color: textMuted }}>
                      {t("stats.current_streak")}
                    </p>
                  </motion.div>

                  {/* Homework */}
                  <motion.div
                    className="rounded-2xl border-2 p-4"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: "#22C55E",
                      boxShadow: `4px 4px 0px #22C55E`,
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: "#D4F5D4" }}
                    >
                      <CheckCircle className="w-5 h-5" style={{ color: "#22C55E" }} />
                    </div>
                    <p className="font-felipa text-2xl" style={{ color: "#22C55E" }}>
                      {completedHomework.length}
                    </p>
                    <p className="font-kanit text-xs" style={{ color: textMuted }}>
                      {t("stats.homework_completed")}
                    </p>
                  </motion.div>

                  {/* Quizzes */}
                  <motion.div
                    className="rounded-2xl border-2 p-4"
                    style={{
                      backgroundColor: cardBg,
                      borderColor: "#8B5CF6",
                      boxShadow: `4px 4px 0px #8B5CF6`,
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: "#E8D5F2" }}
                    >
                      <Brain className="w-5 h-5" style={{ color: "#8B5CF6" }} />
                    </div>
                    <p className="font-felipa text-2xl" style={{ color: "#8B5CF6" }}>
                      {reviewStats.totalSessions}
                    </p>
                    <p className="font-kanit text-xs" style={{ color: textMuted }}>
                      {t("stats.quizzes_taken")}
                    </p>
                  </motion.div>
                </div>

                {/* Weekly Chart */}
                <FolderCard title="กิจกรรม 7 วันล่าสุด">
                  <div className="flex items-end justify-between h-40 gap-2 px-2">
                    {chartData.map((day, index) => (
                      <div key={day.date} className="flex-1 flex flex-col items-center">
                        <motion.div
                          className="w-full rounded-t-lg"
                          style={{
                            backgroundColor: primaryColor,
                            height: `${(day.studyMinutes / maxStudyMinutes) * 100}%`,
                            minHeight: day.studyMinutes > 0 ? 8 : 0,
                          }}
                          initial={{ height: 0 }}
                          animate={{
                            height: `${(day.studyMinutes / maxStudyMinutes) * 100}%`,
                          }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        />
                        <p
                          className="font-kanit text-xs mt-2"
                          style={{ color: textMuted }}
                        >
                          {day.label}
                        </p>
                        <p
                          className="font-kanit text-[10px]"
                          style={{ color: textMuted }}
                        >
                          {day.studyMinutes}m
                        </p>
                      </div>
                    ))}
                  </div>
                </FolderCard>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Subjects Overview */}
                  <FolderCard title="วิชาที่เรียน">
                    <div className="space-y-3">
                      {homework.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-kanit text-sm" style={{ color: textMuted }}>
                              การบ้านทั้งหมด
                            </span>
                            <span
                              className="font-felipa text-lg"
                              style={{ color: primaryColor }}
                            >
                              {homework.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-kanit text-sm" style={{ color: textMuted }}>
                              เสร็จแล้ว
                            </span>
                            <span
                              className="font-felipa text-lg"
                              style={{ color: "#22C55E" }}
                            >
                              {completedHomework.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-kanit text-sm" style={{ color: textMuted }}>
                              อัตราความสำเร็จ
                            </span>
                            <span
                              className="font-felipa text-lg"
                              style={{ color: primaryColor }}
                            >
                              {homework.length > 0
                                ? Math.round((completedHomework.length / homework.length) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-center py-4" style={{ color: textMuted }}>
                          ยังไม่มีข้อมูล
                        </p>
                      )}
                    </div>
                  </FolderCard>

                  {/* Flashcards Overview */}
                  <FolderCard title="แฟลชการ์ด">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-kanit text-sm" style={{ color: textMuted }}>
                          การ์ดทั้งหมด
                        </span>
                        <span className="font-felipa text-lg" style={{ color: primaryColor }}>
                          {flashcards.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-kanit text-sm" style={{ color: textMuted }}>
                          คะแนน Quiz เฉลี่ย
                        </span>
                        <span className="font-felipa text-lg" style={{ color: "#8B5CF6" }}>
                          {reviewStats.averageScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-kanit text-sm" style={{ color: textMuted }}>
                          ความแม่นยำ
                        </span>
                        <span className="font-felipa text-lg" style={{ color: "#22C55E" }}>
                          {reviewStats.accuracy}%
                        </span>
                      </div>
                    </div>
                  </FolderCard>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
