"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Homework,
  Todo,
  Schedule,
  UserStats,
  UserSettings,
  Flashcard,
  ReviewSession,
  QuizQuestion,
  getHomework,
  getTodos,
  getSchedule,
  getScheduleByDay,
  getUserStats,
  getUserSettings,
  getFlashcards,
  getReviewSessions,
  getQuizQuestions,
  createHomework,
  createTodo,
  createScheduleItem,
  createFlashcard,
  createQuizQuestion,
  createQuizQuestionsBatch,
  saveReviewSession,
  updateHomework,
  updateTodo,
  updateScheduleItem,
  updateFlashcardAfterReview,
  updateQuizQuestionStats,
  deleteHomework,
  deleteTodo,
  deleteScheduleItem,
  deleteFlashcard,
  deleteQuizQuestion,
  deleteQuizQuestionsBySubject,
  completeHomework,
  updateUserStats,
  updateUserSettings,
  initializeNewUser,
} from "@/lib/firebaseServices";

// =====================
// useSubjects Hook
// =====================

import { useSubjectContext } from "@/contexts/SubjectContext";

export function useSubjects() {
  return useSubjectContext();
}

// =====================
// useHomework Hook
// =====================

export function useHomework(subjectId?: string) {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomework = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getHomework(user.uid);
      if (subjectId) {
        setHomework(data.filter((h) => h.subjectId === subjectId));
      } else {
        setHomework(data);
      }
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดการบ้านได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, subjectId]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const addHomework = async (
    data: Omit<Homework, "id" | "userId" | "createdAt" | "completed">
  ) => {
    if (!user) return;
    await createHomework(user.uid, data);
    await fetchHomework();
  };

  const editHomework = async (id: string, data: Partial<Homework>) => {
    await updateHomework(id, data);
    await fetchHomework();
  };

  const markComplete = async (id: string) => {
    await completeHomework(id);
    await fetchHomework();
  };

  const completeHomeworkItem = async (id: string, completed: boolean) => {
    if (completed) {
      await updateHomework(id, {
        completed: true,
        completedAt: new Date()
      });
    } else {
      // Use separate update to remove completedAt field
      await updateHomework(id, { completed: false });
    }
    await fetchHomework();
  };

  const removeHomework = async (id: string) => {
    await deleteHomework(id);
    await fetchHomework();
  };

  // Calculate stats
  const pendingHomework = homework.filter((h) => !h.completed);
  const completedHomework = homework.filter((h) => h.completed);
  const urgentHomework = homework.filter(
    (h) => !h.completed && h.dueDate <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  );

  return {
    homework,
    pendingHomework,
    completedHomework,
    urgentHomework,
    loading,
    error,
    addHomework,
    editHomework,
    markComplete,
    completeHomeworkItem,
    removeHomework,
    refetch: fetchHomework,
  };
}

// =====================
// useTodos Hook (Updated for new system)
// =====================

export function useTodos(categoryFilter?: "all" | "homework" | "personal" | "other") {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTodos(user.uid);
      setTodos(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลด Todo ได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (data: {
    text: string;
    category: "homework" | "personal" | "other";
    subjectId?: string;
    subjectName?: string;
    dueDate?: Date;
  }) => {
    if (!user) return;
    const order = todos.length;
    await createTodo(user.uid, { ...data, order });
    await fetchTodos();
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await updateTodo(id, { completed });
    await fetchTodos();
  };

  const editTodo = async (id: string, data: Partial<Todo>) => {
    await updateTodo(id, data);
    await fetchTodos();
  };

  const removeTodo = async (id: string) => {
    await deleteTodo(id);
    await fetchTodos();
  };

  // Filter todos
  const filteredTodos = categoryFilter && categoryFilter !== "all"
    ? todos.filter(t => t.category === categoryFilter)
    : todos;

  const pendingTodos = filteredTodos.filter(t => !t.completed);
  const completedTodos = filteredTodos.filter(t => t.completed);

  // Overdue todos
  const overdueTodos = pendingTodos.filter(t => {
    if (!t.dueDate) return false;
    return t.dueDate < new Date();
  });

  return {
    todos: filteredTodos,
    allTodos: todos,
    pendingTodos,
    completedTodos,
    overdueTodos,
    loading,
    error,
    addTodo,
    toggleTodo,
    editTodo,
    removeTodo,
    refetch: fetchTodos,
  };
}

// =====================
// useSchedule Hook
// =====================

export function useSchedule(dayOfWeek?: number) {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data =
        dayOfWeek !== undefined
          ? await getScheduleByDay(user.uid, dayOfWeek)
          : await getSchedule(user.uid);

      // Sort by start time
      data.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setSchedule(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดตารางเรียนได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, dayOfWeek]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const addScheduleItem = async (data: Omit<Schedule, "id" | "userId">) => {
    if (!user) return;
    await createScheduleItem(user.uid, data);
    await fetchSchedule();
  };

  const editScheduleItem = async (id: string, data: Partial<Schedule>) => {
    await updateScheduleItem(id, data);
    await fetchSchedule();
  };

  const removeScheduleItem = async (id: string) => {
    await deleteScheduleItem(id);
    await fetchSchedule();
  };

  return {
    schedule,
    loading,
    error,
    addScheduleItem,
    editScheduleItem,
    removeScheduleItem,
    refetch: fetchSchedule,
  };
}

// =====================
// useUserStats Hook
// =====================

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserStats(user.uid);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateStats = async (data: Partial<UserStats>) => {
    if (!user) return;
    await updateUserStats(user.uid, data);
    await fetchStats();
  };

  return {
    stats,
    loading,
    updateStats,
    refetch: fetchStats,
  };
}

// =====================
// useUserSettings Hook
// =====================

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserSettings(user.uid);
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (data: Partial<UserSettings>) => {
    if (!user) return;
    await updateUserSettings(user.uid, data);
    await fetchSettings();
  };

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
}

// =====================
// useFlashcards Hook
// =====================

export function useFlashcards(subjectId?: string) {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getFlashcards(user.uid, subjectId);
      setFlashcards(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลด Flashcard ได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, subjectId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const addFlashcard = async (data: { question: string; answer: string; subjectId: string }) => {
    if (!user) return;
    await createFlashcard(user.uid, data);
    await fetchFlashcards();
  };

  const reviewFlashcard = async (flashcardId: string, quality: number) => {
    await updateFlashcardAfterReview(flashcardId, quality);
    await fetchFlashcards();
  };

  const removeFlashcard = async (id: string) => {
    await deleteFlashcard(id);
    await fetchFlashcards();
  };

  // Cards due for review
  const dueForReview = flashcards.filter(f => f.nextReviewDate <= new Date());

  return {
    flashcards,
    dueForReview,
    loading,
    error,
    addFlashcard,
    reviewFlashcard,
    removeFlashcard,
    refetch: fetchFlashcards,
  };
}

// =====================
// useReviewSessions Hook
// =====================

export function useReviewSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getReviewSessions(user.uid);
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const addSession = async (data: Omit<ReviewSession, "id" | "userId" | "completedAt">) => {
    if (!user) return;
    await saveReviewSession(user.uid, data);
    await fetchSessions();
  };

  // Calculate stats
  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
  const averageScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;
  const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);

  return {
    sessions,
    loading,
    addSession,
    stats: {
      totalSessions: sessions.length,
      averageScore,
      totalQuestions,
      totalCorrect,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    },
    refetch: fetchSessions,
  };
}

// =====================
// useInitializeUser Hook
// =====================

export function useInitializeUser() {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!user) return;

      try {
        await initializeNewUser(user.uid);
        setInitialized(true);
      } catch (err) {
        console.error("Error initializing user:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [user]);

  return { initialized, loading };
}

// =====================
// useQuizQuestions Hook (AI-Generated & CSV Questions)
// =====================

export function useQuizQuestions(subjectId?: string) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getQuizQuestions(user.uid, subjectId);
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดคำถามได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, subjectId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const addQuestion = async (
    data: Omit<QuizQuestion, "id" | "userId" | "createdAt" | "timesUsed" | "correctRate">
  ) => {
    if (!user) return;
    await createQuizQuestion(user.uid, data);
    await fetchQuestions();
  };

  const addQuestions = async (
    questionsData: Omit<QuizQuestion, "id" | "userId" | "createdAt" | "timesUsed" | "correctRate">[]
  ) => {
    if (!user) return;
    await createQuizQuestionsBatch(user.uid, questionsData);
    await fetchQuestions();
  };

  const updateStats = async (questionId: string, wasCorrect: boolean) => {
    await updateQuizQuestionStats(questionId, wasCorrect);
    await fetchQuestions();
  };

  const removeQuestion = async (id: string) => {
    await deleteQuizQuestion(id);
    await fetchQuestions();
  };

  const removeQuestionsBySubject = async (subjId: string) => {
    if (!user) return;
    await deleteQuizQuestionsBySubject(user.uid, subjId);
    await fetchQuestions();
  };

  // Get questions by difficulty
  const easyQuestions = questions.filter((q) => q.difficulty === "easy");
  const mediumQuestions = questions.filter((q) => q.difficulty === "medium");
  const hardQuestions = questions.filter((q) => q.difficulty === "hard");

  // Get questions by source
  const aiQuestions = questions.filter((q) => q.source === "ai");
  const csvQuestions = questions.filter((q) => q.source === "csv");
  const flashcardQuestions = questions.filter((q) => q.source === "flashcard");

  return {
    questions,
    easyQuestions,
    mediumQuestions,
    hardQuestions,
    aiQuestions,
    csvQuestions,
    flashcardQuestions,
    loading,
    generating,
    setGenerating,
    error,
    addQuestion,
    addQuestions,
    updateStats,
    removeQuestion,
    removeQuestionsBySubject,
    refetch: fetchQuestions,
  };
}
