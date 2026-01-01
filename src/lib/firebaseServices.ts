import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// =====================
// Types
// =====================

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
  order: number;
  createdAt: Date;
}

export interface Homework {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  urgent: boolean;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: "homework" | "personal" | "other"; // ประเภท
  subjectId?: string; // ถ้าเป็นการบ้านจะมี subjectId
  subjectName?: string; // ชื่อวิชา (for display)
  dueDate?: Date; // วันกำหนดส่ง
  userId: string;
  order: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subjectId: string;
  userId: string;
  // Spaced Repetition Data
  easeFactor: number; // 2.5 default, ยิ่งสูงยิ่งง่าย
  interval: number; // จำนวนวันก่อนทบทวนครั้งต่อไป
  repetitions: number; // จำนวนครั้งที่ตอบถูกติดต่อกัน
  nextReviewDate: Date; // วันที่ควรทบทวน
  lastReviewDate?: Date;
  correctCount: number;
  wrongCount: number;
  createdAt: Date;
}

export interface ReviewSession {
  id: string;
  userId: string;
  subjectId?: string;
  gameMode: "quiz" | "memory" | "speed";
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: number; // seconds
  completedAt: Date;
}

export interface Schedule {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "08:00"
  endTime: string; // "09:00"
  subjectId: string;
  subjectName?: string;
  room?: string;
  teacher?: string;
  userId: string;
}

export interface UserStats {
  totalHomework: number;
  completedHomework: number;
  upcomingExams: number;
  averageScore: number;
  studyStreak: number;
  lastStudyDate: Date;
}

export interface UserSettings {
  tutorialCompleted: boolean;
  theme: "light" | "dark" | "auto";
  notifications: boolean;
  musicEnabled: boolean;
  preferredLanguage: "th" | "en";
}

// =====================
// Subjects
// =====================

export async function getSubjects(userId: string): Promise<Subject[]> {
  const q = query(
    collection(db, "subjects"),
    where("userId", "==", userId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Subject[];
}

export async function createSubject(
  userId: string,
  data: Omit<Subject, "id" | "userId" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "subjects"), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSubject(
  subjectId: string,
  data: Partial<Subject>
): Promise<void> {
  await updateDoc(doc(db, "subjects", subjectId), data);
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await deleteDoc(doc(db, "subjects", subjectId));
}

// Default subjects for new users
export const defaultSubjects = [
  { name: "คณิตศาสตร์", icon: "calculator", color: "yellow", order: 0 },
  { name: "วิทยาศาสตร์", icon: "flask", color: "green", order: 1 },
  { name: "ภาษาอังกฤษ", icon: "globe", color: "blue", order: 2 },
  { name: "ภาษาไทย", icon: "book", color: "pink", order: 3 },
  { name: "ศิลปะ", icon: "palette", color: "purple", order: 4 },
  { name: "ดนตรี", icon: "music", color: "orange", order: 5 },
];

export async function initializeUserSubjects(userId: string): Promise<void> {
  // Don't create default subjects - let user add their own
  // Just ensure the user can access the subjects collection
  return Promise.resolve();
}

// =====================
// Homework
// =====================

export async function getHomework(userId: string): Promise<Homework[]> {
  const q = query(
    collection(db, "homework"),
    where("userId", "==", userId),
    orderBy("dueDate", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: doc.data().dueDate?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    completedAt: doc.data().completedAt?.toDate(),
  })) as Homework[];
}

export async function getHomeworkBySubject(
  userId: string,
  subjectId: string
): Promise<Homework[]> {
  const q = query(
    collection(db, "homework"),
    where("userId", "==", userId),
    where("subjectId", "==", subjectId),
    orderBy("dueDate", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: doc.data().dueDate?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Homework[];
}

export async function createHomework(
  userId: string,
  data: Omit<Homework, "id" | "userId" | "createdAt" | "completed">
): Promise<string> {
  // Filter out undefined values - Firestore doesn't accept undefined
  const cleanData: Record<string, unknown> = {
    title: data.title,
    subjectId: data.subjectId,
    dueDate: data.dueDate,
    urgent: data.urgent,
    userId,
    completed: false,
    createdAt: serverTimestamp(),
  };
  
  // Only add description if it has a value
  if (data.description !== undefined && data.description !== "") {
    cleanData.description = data.description;
  }
  
  const docRef = await addDoc(collection(db, "homework"), cleanData);
  return docRef.id;
}

export async function updateHomework(
  homeworkId: string,
  data: Partial<Homework>
): Promise<void> {
  await updateDoc(doc(db, "homework", homeworkId), data);
}

export async function completeHomework(homeworkId: string): Promise<void> {
  await updateDoc(doc(db, "homework", homeworkId), {
    completed: true,
    completedAt: serverTimestamp(),
  });
}

export async function deleteHomework(homeworkId: string): Promise<void> {
  await deleteDoc(doc(db, "homework", homeworkId));
}

// =====================
// Todos (New System)
// =====================

export async function getTodos(userId: string): Promise<Todo[]> {
  const q = query(
    collection(db, "todos"),
    where("userId", "==", userId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    dueDate: doc.data().dueDate?.toDate(),
    completedAt: doc.data().completedAt?.toDate(),
  })) as Todo[];
}

export async function createTodo(
  userId: string,
  data: {
    text: string;
    category: "homework" | "personal" | "other";
    subjectId?: string;
    subjectName?: string;
    dueDate?: Date;
    order: number;
  }
): Promise<string> {
  const cleanData: Record<string, unknown> = {
    text: data.text,
    category: data.category,
    completed: false,
    userId,
    order: data.order,
    createdAt: serverTimestamp(),
  };
  
  if (data.subjectId) cleanData.subjectId = data.subjectId;
  if (data.subjectName) cleanData.subjectName = data.subjectName;
  if (data.dueDate) cleanData.dueDate = data.dueDate;
  
  const docRef = await addDoc(collection(db, "todos"), cleanData);
  return docRef.id;
}

export async function updateTodo(
  todoId: string,
  data: Partial<Todo>
): Promise<void> {
  const updateData: Record<string, unknown> = { ...data };
  if (data.completed) {
    updateData.completedAt = serverTimestamp();
  }
  await updateDoc(doc(db, "todos", todoId), updateData);
}

export async function deleteTodo(todoId: string): Promise<void> {
  await deleteDoc(doc(db, "todos", todoId));
}

// =====================
// Flashcards (Review System)
// =====================

export async function getFlashcards(userId: string, subjectId?: string): Promise<Flashcard[]> {
  let q;
  if (subjectId) {
    q = query(
      collection(db, "flashcards"),
      where("userId", "==", userId),
      where("subjectId", "==", subjectId)
    );
  } else {
    q = query(
      collection(db, "flashcards"),
      where("userId", "==", userId)
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    nextReviewDate: doc.data().nextReviewDate?.toDate() || new Date(),
    lastReviewDate: doc.data().lastReviewDate?.toDate(),
  })) as Flashcard[];
}

export async function getFlashcardsDueForReview(userId: string): Promise<Flashcard[]> {
  const now = new Date();
  const q = query(
    collection(db, "flashcards"),
    where("userId", "==", userId),
    where("nextReviewDate", "<=", now)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    nextReviewDate: doc.data().nextReviewDate?.toDate() || new Date(),
    lastReviewDate: doc.data().lastReviewDate?.toDate(),
  })) as Flashcard[];
}

export async function createFlashcard(
  userId: string,
  data: { question: string; answer: string; subjectId: string }
): Promise<string> {
  const docRef = await addDoc(collection(db, "flashcards"), {
    question: data.question,
    answer: data.answer,
    subjectId: data.subjectId,
    userId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date(),
    correctCount: 0,
    wrongCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// SM-2 Spaced Repetition Algorithm
export async function updateFlashcardAfterReview(
  flashcardId: string,
  quality: number // 0-5: 0=blackout, 5=perfect
): Promise<void> {
  const docRef = doc(db, "flashcards", flashcardId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return;
  
  const card = docSnap.data();
  let { easeFactor, interval, repetitions, correctCount, wrongCount } = card;
  
  if (quality >= 3) {
    // Correct answer
    correctCount++;
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    // Wrong answer
    wrongCount++;
    repetitions = 0;
    interval = 1;
  }
  
  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  await updateDoc(docRef, {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: serverTimestamp(),
    correctCount,
    wrongCount,
  });
}

export async function deleteFlashcard(flashcardId: string): Promise<void> {
  await deleteDoc(doc(db, "flashcards", flashcardId));
}

// =====================
// Review Sessions
// =====================

export async function saveReviewSession(
  userId: string,
  data: Omit<ReviewSession, "id" | "userId" | "completedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "reviewSessions"), {
    ...data,
    userId,
    completedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getReviewSessions(userId: string, limit = 10): Promise<ReviewSession[]> {
  const q = query(
    collection(db, "reviewSessions"),
    where("userId", "==", userId),
    orderBy("completedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limit).map((doc) => ({
    id: doc.id,
    ...doc.data(),
    completedAt: doc.data().completedAt?.toDate() || new Date(),
  })) as ReviewSession[];
}

// =====================
// Schedule
// =====================

export async function getSchedule(userId: string): Promise<Schedule[]> {
  const q = query(
    collection(db, "schedules"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Schedule[];
}

export async function getScheduleByDay(
  userId: string,
  dayOfWeek: number
): Promise<Schedule[]> {
  const q = query(
    collection(db, "schedules"),
    where("userId", "==", userId),
    where("dayOfWeek", "==", dayOfWeek)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Schedule[];
}

export async function createScheduleItem(
  userId: string,
  data: Omit<Schedule, "id" | "userId">
): Promise<string> {
  // Filter out undefined values (Firestore doesn't accept undefined)
  const cleanData: Record<string, unknown> = { userId };
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });
  
  const docRef = await addDoc(collection(db, "schedules"), cleanData);
  return docRef.id;
}

export async function updateScheduleItem(
  scheduleId: string,
  data: Partial<Schedule>
): Promise<void> {
  // Filter out undefined values
  const cleanData: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });
  await updateDoc(doc(db, "schedules", scheduleId), cleanData);
}

export async function deleteScheduleItem(scheduleId: string): Promise<void> {
  await deleteDoc(doc(db, "schedules", scheduleId));
}

// =====================
// User Stats
// =====================

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const docRef = doc(db, "userStats", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      lastStudyDate: data.lastStudyDate?.toDate() || new Date(),
    } as UserStats;
  }
  return null;
}

export async function updateUserStats(
  userId: string,
  data: Partial<UserStats>
): Promise<void> {
  await setDoc(doc(db, "userStats", userId), data, { merge: true });
}

export async function initializeUserStats(userId: string): Promise<void> {
  const existing = await getUserStats(userId);
  if (!existing) {
    await setDoc(doc(db, "userStats", userId), {
      totalHomework: 0,
      completedHomework: 0,
      upcomingExams: 0,
      averageScore: 0,
      studyStreak: 0,
      lastStudyDate: serverTimestamp(),
    });
  }
}

// =====================
// User Settings
// =====================

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const docRef = doc(db, "userSettings", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserSettings;
  }
  return null;
}

export async function updateUserSettings(
  userId: string,
  data: Partial<UserSettings>
): Promise<void> {
  await setDoc(doc(db, "userSettings", userId), data, { merge: true });
}

export async function initializeUserSettings(userId: string): Promise<void> {
  const existing = await getUserSettings(userId);
  if (!existing) {
    await setDoc(doc(db, "userSettings", userId), {
      tutorialCompleted: false,
      theme: "light",
      notifications: true,
      musicEnabled: true,
      preferredLanguage: "th",
    });
  }
}

// =====================
// Initialize New User
// =====================

export async function initializeNewUser(userId: string): Promise<void> {
  await Promise.all([
    initializeUserSubjects(userId),
    initializeUserStats(userId),
    initializeUserSettings(userId),
  ]);
}
