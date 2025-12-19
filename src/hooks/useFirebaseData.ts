"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Subject,
  Homework,
  Todo,
  Schedule,
  UserStats,
  UserSettings,
  getSubjects,
  getHomework,
  getTodos,
  getSchedule,
  getScheduleByDay,
  getUserStats,
  getUserSettings,
  createSubject,
  createHomework,
  createTodo,
  createScheduleItem,
  updateSubject,
  updateHomework,
  updateTodo,
  updateScheduleItem,
  deleteSubject,
  deleteHomework,
  deleteTodo,
  deleteScheduleItem,
  completeHomework,
  updateUserStats,
  updateUserSettings,
  initializeNewUser,
} from "@/lib/firebaseServices";

// =====================
// useSubjects Hook
// =====================

export function useSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getSubjects(user.uid);
      setSubjects(data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดวิชาได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const addSubject = async (data: Omit<Subject, "id" | "userId" | "createdAt">) => {
    if (!user) return;
    await createSubject(user.uid, data);
    await fetchSubjects();
  };

  const editSubject = async (id: string, data: Partial<Subject>) => {
    await updateSubject(id, data);
    await fetchSubjects();
  };

  const removeSubject = async (id: string) => {
    await deleteSubject(id);
    await fetchSubjects();
  };

  return {
    subjects,
    loading,
    error,
    addSubject,
    editSubject,
    removeSubject,
    refetch: fetchSubjects,
  };
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
// useTodos Hook
// =====================

export function useTodos() {
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

  const addTodo = async (text: string) => {
    if (!user) return;
    const order = todos.length;
    await createTodo(user.uid, text, order);
    await fetchTodos();
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await updateTodo(id, { completed });
    await fetchTodos();
  };

  const editTodo = async (id: string, text: string) => {
    await updateTodo(id, { text });
    await fetchTodos();
  };

  const removeTodo = async (id: string) => {
    await deleteTodo(id);
    await fetchTodos();
  };

  return {
    todos,
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
