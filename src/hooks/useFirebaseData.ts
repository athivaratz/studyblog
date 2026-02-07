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
  QuizSet,
  Tag,
  Note,
  StudyGoal,
  StudySession,
  DailyStats,
  SharedQuiz,
  getHomework,
  getTodos,
  getSchedule,
  getScheduleByDay,
  getUserStats,
  getUserSettings,
  getFlashcards,
  getReviewSessions,
  getQuizQuestions,
  getQuizSets,
  getTags,
  getNotes,
  getStudyGoals,
  getStudySessions,
  getDailyStats,
  getSharedQuizByCode,
  createHomework,
  createTodo,
  createScheduleItem,
  createFlashcard,
  createQuizQuestion,
  createQuizQuestionsBatch,
  createQuizSet,
  createTag,
  createNote,
  createStudyGoal,
  createStudySession,
  createSharedQuiz,
  saveReviewSession,
  updateHomework,
  updateTodo,
  updateScheduleItem,
  updateFlashcardAfterReview,
  updateQuizQuestion,
  updateQuizQuestionStats,
  updateQuizSet,
  updateTag,
  updateNote,
  updateStudyGoal,
  updateStudySession,
  updateDailyStats,
  deleteHomework,
  deleteTodo,
  deleteScheduleItem,
  deleteFlashcard,
  deleteQuizQuestion,
  deleteQuizQuestionsBySubject,
  deleteQuizSetWithQuestions,
  deleteTag,
  deleteNote,
  deleteStudyGoal,
  deleteSharedQuiz,
  completeHomework,
  updateUserStats,
  updateUserSettings,
  initializeNewUser,
  calculateStudyStreak,
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
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [data, sets] = await Promise.all([
        getQuizQuestions(user.uid, subjectId),
        getQuizSets(user.uid),
      ]);
      setQuestions(data);
      setQuizSets(sets);
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

  // Add a quiz set with its questions
  const addQuizSet = async (
    setData: { name: string; description?: string; subjectId: string; subjectName: string; source: "ai" | "csv" },
    questionsData: Omit<QuizQuestion, "id" | "userId" | "createdAt" | "timesUsed" | "correctRate" | "quizSetId" | "quizSetName">[]
  ) => {
    if (!user) return;
    const setId = await createQuizSet(user.uid, {
      ...setData,
      questionCount: questionsData.length,
    });
    await createQuizQuestionsBatch(
      user.uid,
      questionsData.map(q => ({
        ...q,
        quizSetId: setId,
        quizSetName: setData.name,
      }))
    );
    await fetchQuestions();
    return setId;
  };

  const editQuestion = async (
    questionId: string,
    data: Partial<Pick<QuizQuestion, "question" | "correctAnswer" | "wrongAnswers" | "difficulty" | "topic" | "explanation">>
  ) => {
    await updateQuizQuestion(questionId, data);
    await fetchQuestions();
  };

  const editQuizSet = async (
    setId: string,
    data: Partial<Pick<QuizSet, "name" | "description">>
  ) => {
    await updateQuizSet(setId, data);
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

  const removeQuizSet = async (setId: string) => {
    if (!user) return;
    await deleteQuizSetWithQuestions(user.uid, setId);
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
    quizSets,
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
    addQuizSet,
    editQuestion,
    editQuizSet,
    updateStats,
    removeQuestion,
    removeQuestionsBySubject,
    removeQuizSet,
    refetch: fetchQuestions,
  };
}

// =====================
// useTags Hook
// =====================

export function useTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTags(user.uid);
      setTags(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดแท็กได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = async (data: { name: string; color: string }) => {
    if (!user) return;
    await createTag(user.uid, data);
    await fetchTags();
  };

  const editTag = async (id: string, data: Partial<Tag>) => {
    await updateTag(id, data);
    await fetchTags();
  };

  const removeTag = async (id: string) => {
    await deleteTag(id);
    await fetchTags();
  };

  return {
    tags,
    loading,
    error,
    addTag,
    editTag,
    removeTag,
    refetch: fetchTags,
  };
}

// =====================
// useNotes Hook
// =====================

export function useNotes(subjectId?: string) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotes(user.uid, subjectId);
      setNotes(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดบันทึกได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, subjectId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (data: { title: string; content: string; subjectId: string }) => {
    if (!user) return;
    await createNote(user.uid, data);
    await fetchNotes();
  };

  const editNote = async (id: string, data: Partial<Note>) => {
    await updateNote(id, data);
    await fetchNotes();
  };

  const removeNote = async (id: string) => {
    await deleteNote(id);
    await fetchNotes();
  };

  return {
    notes,
    loading,
    error,
    addNote,
    editNote,
    removeNote,
    refetch: fetchNotes,
  };
}

// =====================
// useStudyGoals Hook
// =====================

export function useStudyGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getStudyGoals(user.uid);
      setGoals(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดเป้าหมายได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (
    data: Omit<StudyGoal, "id" | "userId" | "createdAt" | "currentValue" | "completed">
  ) => {
    if (!user) return;
    await createStudyGoal(user.uid, data);
    await fetchGoals();
  };

  const updateGoal = async (id: string, data: Partial<StudyGoal>) => {
    await updateStudyGoal(id, data);
    await fetchGoals();
  };

  const removeGoal = async (id: string) => {
    await deleteStudyGoal(id);
    await fetchGoals();
  };

  // Stats
  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return {
    goals,
    activeGoals,
    completedGoals,
    loading,
    error,
    addGoal,
    updateGoal,
    removeGoal,
    refetch: fetchGoals,
  };
}

// =====================
// useStudySessions Hook
// =====================

export function useStudySessions(days: number = 7) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      const data = await getStudySessions(user.uid, fromDate);
      setSessions(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดเซสชันการเรียนได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, days]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const addSession = async (
    data: Omit<StudySession, "id" | "userId" | "startedAt">
  ) => {
    if (!user) return;
    await createStudySession(user.uid, data);
    await fetchSessions();
  };

  const editSession = async (id: string, data: Partial<StudySession>) => {
    await updateStudySession(id, data);
    await fetchSessions();
  };

  // Calculate total study time
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 6) / 10; // Round to 1 decimal

  return {
    sessions,
    loading,
    error,
    addSession,
    editSession,
    totalMinutes,
    totalHours,
    refetch: fetchSessions,
  };
}

// =====================
// useDailyStats Hook
// =====================

export function useDailyStats(days: number = 7) {
  const { user } = useAuth();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getDailyStats(user.uid, days);
      setDailyStats(data);
      
      // Calculate streak
      const currentStreak = await calculateStudyStreak(user.uid);
      setStreak(currentStreak);
      
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดสถิติรายวันได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, days]);

  useEffect(() => {
    fetchDailyStats();
  }, [fetchDailyStats]);

  const updateStats = async (date: string, data: Partial<DailyStats>) => {
    if (!user) return;
    await updateDailyStats(user.uid, date, data);
    await fetchDailyStats();
  };

  return {
    dailyStats,
    streak,
    loading,
    error,
    updateStats,
    refetch: fetchDailyStats,
  };
}

// =====================
// useSharedQuiz Hook
// =====================

interface ShareQuizOptions {
  questions?: Array<{
    question: string;
    correctAnswer: string;
    wrongAnswers: string[];
    difficulty?: "easy" | "medium" | "hard";
    explanation?: string;
  }>;
  description?: string;
  subjectName?: string;
  subjectId?: string;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  tags?: string[];
}

export function useSharedQuiz() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareQuiz = async (
    userName: string,
    quizBankId: string,
    title: string,
    questionCount: number,
    expiresInDays?: number,
    options?: ShareQuizOptions
  ): Promise<SharedQuiz | null> => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    try {
      const sharedQuiz = await createSharedQuiz(
        user.uid,
        userName,
        quizBankId,
        title,
        questionCount,
        expiresInDays,
        options
      );
      return sharedQuiz;
    } catch (err) {
      setError("ไม่สามารถแชร์แบบทดสอบได้");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const importQuiz = async (shareCode: string): Promise<SharedQuiz | null> => {
    setLoading(true);
    setError(null);
    try {
      const quiz = await getSharedQuizByCode(shareCode);
      if (!quiz) {
        setError("ไม่พบแบบทดสอบ หรือรหัสหมดอายุแล้ว");
        return null;
      }
      return quiz;
    } catch (err) {
      setError("ไม่สามารถนำเข้าแบบทดสอบได้");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeSharedQuiz = async (id: string) => {
    await deleteSharedQuiz(id);
  };

  return {
    loading,
    error,
    shareQuiz,
    importQuiz,
    removeSharedQuiz,
  };
}
